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
   * Creates a chat completion using the OpenAI-compatible API
   * 
   * @param model The model to use
   * @param messages The messages to send
   * @param options Additional options
   * @returns A promise that resolves to the chat completion response
   */
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
  ) {
    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages,
        ...options
      });

      return response;
    } catch (error) {
      console.error('Error calling Anura API:', error);
      throw error;
    }
  }

  /**
   * Simplified method to get a completion from a prompt
   * 
   * @param prompt The user's prompt
   * @param model The model to use (defaults to a reasonable model)
   * @param systemPrompt Optional system prompt to set context
   * @returns The assistant's response text
   */
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
    
    const response = await this.createChatCompletion(
      model,
      messages,
      { temperature: 0.7 }
    );
    
    return response.choices[0].message.content || '';
  }
}