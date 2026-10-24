import mongoose from 'mongoose';

export interface DatabaseState {
  isConnected: boolean;
  type: 'MONGODB_ATLAS' | 'IN_MEMORY_PERSISTENCE';
  uri?: string;
  databaseName?: string;
  error?: string;
}

let dbState: DatabaseState = {
  isConnected: false,
  type: 'IN_MEMORY_PERSISTENCE'
};

export async function connectDatabase(): Promise<DatabaseState> {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log('Connecting to MongoDB Atlas...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000
      });

      dbState = {
        isConnected: true,
        type: 'MONGODB_ATLAS',
        uri: uri.replace(/:([^@]+)@/, ':****@'), // Mask password in state
        databaseName: mongoose.connection.name
      };

      console.log(`Connected to MongoDB Atlas: database "${mongoose.connection.name}"`);

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB Atlas disconnected. Falling back to memory store.');
        dbState.isConnected = false;
      });

      return dbState;
    } catch (err: any) {
      console.warn(`MongoDB Atlas connection failed: ${err.message}. Initializing embedded persistence store.`);
      dbState = {
        isConnected: false,
        type: 'IN_MEMORY_PERSISTENCE',
        error: err.message
      };
    }
  } else {
    console.log('MONGODB_URI not provided. Initializing embedded in-memory persistence engine (Atlas ready).');
    dbState = {
      isConnected: false,
      type: 'IN_MEMORY_PERSISTENCE'
    };
  }

  return dbState;
}

export function getDatabaseState(): DatabaseState {
  return { ...dbState };
}
