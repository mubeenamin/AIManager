import express from 'express';
import cors from 'cors';
import { authenticateToken } from './middleware/auth';
import { seedDatabase } from './db/seed';

import authRouter from './routes/auth';
import companiesRouter from './routes/companies';
import productsRouter from './routes/products';
import inventoryRouter from './routes/inventory';
import posRouter from './routes/pos';
import expensesRouter from './routes/expenses';
import aiRouter from './routes/ai';

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for web and mobile frontends
app.use(cors());
app.use(express.json());

// Global Auth & Context Middleware
app.use(authenticateToken);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Business Manager REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/companies', companiesRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/pos', posRouter);
app.use('/api/v1/expenses', expensesRouter);
app.use('/api/v1/ai', aiRouter);

// Start Server and Seed Database
async function startServer() {
  try {
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 REST API Server running at http://localhost:${PORT}/api/v1`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start backend server:', error);
    process.exit(1);
  }
}

startServer();
