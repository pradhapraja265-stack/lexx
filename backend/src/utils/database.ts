import mongoose from 'mongoose';
import { DatabaseConfig } from '../types';

class Database {
  private static instance: Database;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(uri: string): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      const config: DatabaseConfig = {
        uri,
        options: {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          bufferMaxEntries: 0,
          bufferCommands: false,
        },
      };

      await mongoose.connect(config.uri, config.options);
      this.isConnected = true;
      console.log('Connected to MongoDB successfully');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
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

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public isConnectionActive(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public getConnectionState(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
  }

  public async healthCheck(): Promise<{ status: string; state: string }> {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected', state: this.getConnectionState() };
      }

      // Ping the database
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      }
      return { status: 'connected', state: this.getConnectionState() };
    } catch (error) {
      console.error('Database health check failed:', error);
      return { status: 'error', state: this.getConnectionState() };
    }
  }
}

export const database = Database.getInstance();