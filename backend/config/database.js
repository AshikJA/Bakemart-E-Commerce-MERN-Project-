const mongoose = require('mongoose');
const config = require('./config');

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected) {
        console.log('Database already connected');
        return;
      }

      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
      };

      await mongoose.connect(config.MONGODB_URI, options);
      
      this.isConnected = true;
      console.log('MongoDB connected successfully');
      mongoose.connection.on('error', (err) => {
        console.log('MongoDB connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      console.log('MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('MongoDB disconnected gracefully');
    } catch (error) {
      console.log('Error during MongoDB disconnect:', error);
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  }
}

const dbConnection = new DatabaseConnection();

process.on('SIGINT', async () => {
  await dbConnection.disconnect();
  process.exit(0);
});

module.exports = dbConnection;