import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  // Force the app to use the "real" connection logic, pointing to our in-memory server
  process.env.USE_IN_MEMORY_DB = 'false';
});

afterAll(async () => {
  // Ensure all connections are closed
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});
