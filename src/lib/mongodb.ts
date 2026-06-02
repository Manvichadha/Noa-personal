// lib/mongodb.ts
// Lazy singleton — clears itself on error so a broken connection never gets reused.
import { MongoClient } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Add it to .env.local:\n' +
      'MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>'
    );
  }
  const client = new MongoClient(uri);
  return client.connect();
}

function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'development') {
    // In dev, reuse across hot-reloads — but clear the cache if the promise rejects
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClientPromise().catch((err) => {
        // Clear the cache so the next request tries a fresh connection
        global._mongoClientPromise = undefined;
        throw err;
      });
    }
    return global._mongoClientPromise;
  }

  // In production, create a new client per invocation (serverless-safe)
  return createClientPromise();
}

export async function getDb() {
  const dbName = process.env.MONGODB_DB || 'content_automation_db';
  const client = await getClientPromise();
  return client.db(dbName);
}
