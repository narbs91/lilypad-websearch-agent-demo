import { RagService } from '../services/RAGService';
import SearchResult from '../models/SearchResult';

export class WebsearchController {
    private ragService: RagService;

    constructor(ragService: RagService) {
        this.ragService = ragService;
        
        // Bind methods to ensure 'this' context
        this.search = this.search.bind(this);
    }

    /**
     * Handles search requests and returns RAG-enhanced responses
     */
    public async search(query: string): Promise<SearchResult> {
        try {
            
            if (!query || typeof query !== 'string') {
                throw new Error('Query parameter is required and must be a string');
            }
            
            const result = await this.ragService.search(query);
            
            return result;
        } catch (error) {
            console.error('Error in search controller:', error);
            throw new Error('Failed to process search request');
        }
    }
}