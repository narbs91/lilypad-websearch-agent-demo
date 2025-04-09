import * as cheerio from 'cheerio';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import SearchResult from '../models/SearchResult';
import { AnuraClient, WebSearchResponse } from '../client/lilypad/AnuraClient';

const MODEL = "llama3.1:8b";

export class RagService {   
    private anura: AnuraClient;

    constructor() {
        this.anura = new AnuraClient();
    }

    async searchStream(
        query: string, 
        onChunk: (chunk: string) => void
    ): Promise<SearchResult> {
        const urls = await this.getUrls(query);
        const cleanedText = await this.getCleanedText(urls);
        
        // Start streaming the answer
        const answer = await this.answerQuestionStream(query, cleanedText, onChunk);
        const searchResult: SearchResult = {
            answer: answer,
            sources: urls
        };
        return searchResult; // Return the sources
    }

    async search(
        query: string,
    ): Promise<SearchResult> {
        const urls = await this.getUrls(query);
        const cleanedText = await this.getCleanedText(urls);
        const answer = await this.answerQuestion(query, cleanedText);
        const searchResult: SearchResult = {
            answer: answer,
            sources: urls
        };
        return searchResult;
    }

    private async getCleanedText(urls: string[]): Promise<string[]> {
        const texts = [];
        for await (const url of urls) {
            try {
                const getUrl = await fetch(url);
                const html = await getUrl.text();
                const text = this.htmlToText(html, url);
                texts.push(`Source: ${url}\n${text}\n\n`);
            } catch (error) {
                console.error(`Error fetching or processing ${url}:`, error);
                texts.push(`Source: ${url}\nFailed to extract content from this source.\n\n`);
            }
        }
        return texts;
    }
    
    private htmlToText(html: string, url: string): string {
        try {
            // First try with Readability
            const dom = new JSDOM(html, { url });
            const reader = new Readability(dom.window.document);
            const article = reader.parse();
            
            if (article && article.textContent && article.textContent.length > 200) {
                return this.cleanText(article.textContent);
            }
            
            // Fall back to our custom extraction if Readability didn't work well
            return this.fallbackHtmlToText(html);
        } catch (error) {
            console.error("Error using Readability:", error);
            // Fall back to our custom extraction
            return this.fallbackHtmlToText(html);
        }
    }
    
    // Our original extraction method as a fallback
    private fallbackHtmlToText(html: string): string {
        const $ = cheerio.load(html);

        $("script, source, style, head, img, svg, a, form, link, iframe").remove();
        $("*").removeClass();
        $("*").each((_, el) => {
            if (el.type === "tag" || el.type === "script" || el.type === "style") {
                for (const attr of Object.keys(el.attribs || {})) {
                    if (attr.startsWith("data-")) {
                        $(el).removeAttr(attr);
                    }
                }
            }
        });
        const text = $("body").text().replace(/\s+/g, " ");
    
        return text ?? "";
    }

    // Helper method to clean up extracted text
    private cleanText(text: string): string {
        return text
            .replace(/\s+/g, ' ')         // Replace multiple spaces with single space
            .replace(/\n\s*\n/g, '\n\n')  // Replace multiple newlines with double newlines
            .replace(/\t/g, ' ')          // Replace tabs with spaces
            .replace(/\r/g, '')           // Remove carriage returns
            .trim();                      // Trim leading/trailing whitespace
    }

    private async getUrls(query: string): Promise<string[]> {
        
        try {
            const searchResults = await this.anura.webSearchFetch(query, 3) as WebSearchResponse;
            
            const urls = searchResults.results
                .map((result) => result.url)
            
            return urls;
        } catch (error) {
            console.error('Error fetching search results:', error);
            return [];
        }
    }

    private async answerQuestion(
        query: string, 
        texts: string[], 
    ): Promise<string> {
        try {
            const prompt = `Question: ${query}

                        Context:
                        ${texts.join("\n\n")}

                        Instructions:
                        1. Use ONLY the information provided in the context above
                        2. If the context doesn't contain relevant information, say "I cannot answer this question based on the provided information"
                        3. Provide a clear, concise answer
                        4. Cite the sources used in your answer

                        Answer:`;

            const answer = await this.anura.getCompletion(
                prompt,
                MODEL,
                `You are a helpful assistant that can answer questions based on the provided context`
            );

            return answer;
        } catch (error) {
            console.error("Error generating answer:", error);
            const errorMessage = "Sorry, there was an error generating the answer. Please try again.";
            return errorMessage;
        }
}


    private async answerQuestionStream(
        query: string, 
        texts: string[], 
        onChunk: (chunk: string) => void
    ): Promise<string> {
        let fullAnswer = '';
        try {
            const prompt = `Question: ${query}

                        Context:
                        ${texts.join("\n\n")}

                        Instructions:
                        1. Use ONLY the information provided in the context above
                        2. If the context doesn't contain relevant information, say "I cannot answer this question based on the provided information"
                        3. Provide a clear, concise answer
                        4. Cite the sources used in your answer

                        Answer:`;

            await this.anura.getCompletionStream(
                prompt,
                (chunk: string) => {
                    // Skip [DONE] markers
                    if (chunk === '[DONE]') {
                        return;
                    }

                    // Skip error messages
                    if (chunk.includes('Error:') || chunk.includes('failed to unmarshal')) {
                        console.error('Received error in chunk:', chunk);
                        return;
                    }

                    try {
                        // Handle the chunk only if it's actual content
                        if (chunk.trim()) {
                            fullAnswer += chunk;
                            onChunk(chunk);
                        }
                    } catch (e) {
                        console.error('Error processing chunk:', e);
                    }
                },
                MODEL,
                `You are a helpful assistant that can answer questions based on the provided context`
            );

            if (!fullAnswer) {
                throw new Error('No valid response received from the model');
            }

            return fullAnswer;
        } catch (error) {
            console.error("Error generating streaming answer:", error);
            const errorMessage = "Sorry, there was an error generating the answer. Please try again.";
            onChunk(errorMessage);
            return errorMessage;
        }
    }
}

export default RagService;