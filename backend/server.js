const express = require('express');
const http = require('http')

const config = require('./config/config');
const DatabaseConnection = require('./config/database');
const setupRoutes = require('./routes');
const { seedDefaultAdmin } = require('./utils/seedAdmin');
const setupMiddlewares = require('./middlewares/setup');

class Server {
  constructor() {
    this.app = express();
    this.port = config.PORT;
    this.server = http.createServer(this.app);
  }

  async initialize() {
    try {
      await DatabaseConnection.connect();

      // Seed a default admin account if configured
      await seedDefaultAdmin();

      this.middlewares();
      this.routes();
      this.setupGracefulShutdown();
      await this.start();
    } catch (error) {
      console.log('Error initializing server:', error);
      process.exit(1);
    }
  }

  middlewares() {
    setupMiddlewares(this.app);
    }

  routes() {
    // API routes
    setupRoutes(this.app);

    // Health check / root route
    this.app.get('/', (req, res) => {
      res.json({ message: 'API is running' });
    });

    // Error handling middlewares
    const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, () => {
        console.log(`Server running on http://localhost:${this.port}`);
        resolve();
      });

      this.server.on('error', (error) => {
        console.log('Error starting server:', error);
        reject(error);
      });
    });
  }

  setupGracefulShutdown() {
    process.on('SIGINT', async () => {
      await this.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.stop();
      process.exit(0);
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      this.server.close(async (err) => {
        if (err) {
          console.log('Error during server close:', err);
          return reject(err);
        }
        await DatabaseConnection.disconnect();
        console.log('Server stopped');
        resolve();
      });
    });
  }
}

const server = new Server();
server.initialize();