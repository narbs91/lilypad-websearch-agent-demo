import { Router } from 'express';
import { RagService } from '../services/RAGService';
import { WebsearchController } from '../controllers/WebsearchController';
import SearchResult from '../models/SearchResult';

/**
 * ApiFacade provides a simplified interface to the complex subsystem of controllers and services.
 * It delegates client requests to the appropriate objects within the subsystem.
 */
export class ApiFacade {
  private router: Router;
  private websearchController: WebsearchController;

  constructor() {
    this.router = Router();
    
    // Initialize services
    const ragService = new RagService();
    
    // Initialize controllers with their respective services
    this.websearchController = new WebsearchController(ragService);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // RAG routes
    this.router.post('/api/websearch', (req, res) => {
      const { query } = req.body;
      this.websearchController.search(query)
        .then(result => res.json(result))
        .catch(err => res.status(500).json({ error: err.message }));
    });
  }

  public async search(query: string): Promise<SearchResult> {
    return await this.websearchController.search(query);
  }

  /**
   * Returns the configured router with all API routes
   */
  public getRoutes(): Router {
    return this.router;
  }
} 