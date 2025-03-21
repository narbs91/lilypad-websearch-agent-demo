import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { ApiFacade } from './facades/ApiFacade';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for simplicity
}));
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize API Facade
const apiFacade = new ApiFacade();

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Serve the main HTML page for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/websearch', async (req, res) => {
  const { query } = req.body;
  try {
    // The search method handles the entire response
    await apiFacade.search(query, res);
    // Don't send another response - the streaming method already handles it
  } catch (error) {
    // Only send an error response if the streaming hasn't started
    if (!res.headersSent) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
});

app.post('/api/websearch/stream', async (req, res) => {
  const { query } = req.body;
  try {
    // The searchStream method handles the entire response
    await apiFacade.searchStream(query, res);
    // Don't send another response - the streaming method already handles it
  } catch (error) {
    // Only send an error response if the streaming hasn't started
    if (!res.headersSent) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
});


// API routes using the facade
app.use('/api', apiFacade.getRoutes());

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Open http://localhost:${port} in your browser to use the RAG Search Demo`);
});

export default app;