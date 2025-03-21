import OpenAI from 'openai';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AnuraClient {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      baseURL: process.env.ANURA_BASE_URL || 'https://anura-testnet.lilypad.tech/api/v1/',
      apiKey: process.env.ANURA_API_KEY || '',
    });
  }

  /**
   * Creates a streaming chat completion using the OpenAI-compatible API
   * 
   * @param model The model to use
   * @param messages The messages to send
   * @param onChunk Callback function that receives each chunk of the response
   * @param options Additional options
   * @returns A promise that resolves to the complete response text
   */
  async createChatCompletionStream(
    model: string,
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    options: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      stop?: string[];
    } = {}
  ): Promise<string> {
    try {
      
      const stream = await this.openai.chat.completions.create({
        model,
        messages,
        ...options,
        stream: true,
      });
      
      let fullResponse = '';
      
      // Process the stream
      for await (const chunk of stream) {
        // Handle content in the delta
        if (chunk.choices && chunk.choices[0]?.delta?.content) {
          const content = chunk.choices[0].delta.content;
          
          fullResponse += content;
          onChunk(content);
        }
        // Handle finish reason
        else if (chunk.choices && chunk.choices[0]?.finish_reason) {
          console.log(`Stream finished with reason: ${chunk.choices[0].finish_reason}`);
        }
      }
      
      onChunk('[DONE]');
      
      return fullResponse;
    } catch (error) {
      console.error('Error calling Anura API streaming endpoint:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      // Make sure we send the DONE marker even on error
      onChunk('[DONE]');
      throw error;
    }
  }

  async createChatCompletion(
    model: string,
    messages: ChatMessage[],
    options: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      stop?: string[];
    } = {}
  ): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages,
        ...options,
        stream: false,
      });

      if (response.choices && response.choices[0]?.message?.content) {
        return response.choices[0].message.content;
      }
      
      throw new Error('No content in response');
      
    } catch (error) {
      console.error('Error calling Anura API:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      throw error;
    }
  }

  


  async getCompletion(
    prompt: string,
    model: string = 'llama3.1:8b',
    systemPrompt?: string
  ): Promise<string> {
    const messages: ChatMessage[] = [];
  
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });
    
    const completion = await this.createChatCompletion(
      model,
      messages,
      {
        temperature: 0.7,
        max_tokens: 2048 // Ensure we have enough tokens for a complete response
      }
    );

    return completion;
  }

  /**
   * Simplified method to get a streaming completion from a prompt
   * 
   * @param prompt The user's prompt
   * @param onChunk Callback function that receives each chunk of the response
   * @param model The model to use (defaults to a reasonable model)
   * @param systemPrompt Optional system prompt to set context
   * @returns A promise that resolves when the stream is complete
   */
  async getCompletionStream(
    prompt: string,
    onChunk: (chunk: string) => void,
    model: string = 'llama3.1:8b',
    systemPrompt?: string
  ): Promise<string> {
    const messages: ChatMessage[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });
    
    return await this.createChatCompletionStream(
      model,
      messages,
      onChunk,
      { 
        temperature: 0.7,
        max_tokens: 2048 // Ensure we have enough tokens for a complete response
      }
    );
  }
}