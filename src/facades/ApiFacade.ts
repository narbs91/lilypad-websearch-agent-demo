import { Router, Response as ExpressResponse } from 'express';
import { RagService } from '../services/RAGService';
import { WebsearchController } from '../controllers/WebsearchController';

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
    // Streaming RAG route
    this.router.post('/api/websearch/stream', (req, res) => {
      const { query } = req.body;
      this.websearchController.searchStream(query, res)
        .catch(err => {
          if (!res.writableEnded) {
            res.status(500).json({ error: err.message });
          }
        });
    });
  }

  public async searchStream(query: string, res: ExpressResponse): Promise<void> {
    return await this.websearchController.searchStream(query, res);
  }

  /**
   * Returns the configured router with all API routes
   */
  public getRoutes(): Router {
    return this.router;
  }
} 