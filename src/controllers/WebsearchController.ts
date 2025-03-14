import { RagService } from '../services/RAGService';
import SearchResult from '../models/SearchResult';
import { Response as ExpressResponse } from 'express';

export class WebsearchController {
    private ragService: RagService;

    constructor(ragService: RagService) {
        this.ragService = ragService;
        this.searchStream = this.searchStream.bind(this);
    }

    /**
     * Handles streaming search requests
     */
    public async searchStream(query: string, res: ExpressResponse): Promise<void> {
        try {
            if (!query || typeof query !== 'string') {
                throw new Error('Query parameter is required and must be a string');
            }
            
            // Set headers for streaming
            res.setHeader('Content-Type', 'text/event-stream'); 
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            let answer = '';
            
            // Function to send chunks to the client
            const sendChunk = (chunk: string) => {
                if (chunk === '[DONE]') {
                    // Don't end the response here
                    return;
                }
                answer += chunk; // Accumulate the answer
                const chunkData = JSON.stringify({ text: chunk });
                res.write(`data: ${chunkData}\n\n`);
            };
            
            // Start the streaming process and get the SearchResult
            const result: SearchResult = await this.ragService.searchStream(query, sendChunk);
            
            // Send the final response with the SearchResult
            const finalData = JSON.stringify({ 
                done: true,
                answer: result.answer || answer.trim(),
                sources: result.sources
            });
            res.write(`data: ${finalData}\n\n`);
            res.end();
            
        } catch (error) {
            console.error('Error in streaming search controller:', error);
            
            if (!res.writableEnded) {
                const errorData = JSON.stringify({ error: 'Failed to process streaming search request' });
                res.write(`data: ${errorData}\n\n`);
                res.write('data: [DONE]\n\n');
                res.end();
            }
        }
    }
}