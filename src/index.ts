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
    const result = await apiFacade.search(query);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in websearch endpoint:', error);
    res.status(500).json({ error: 'Failed to process search request' });
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