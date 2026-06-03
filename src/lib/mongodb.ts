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
  // Always reuse a global singleton — works correctly for both:
  //   • Development (hot-reload safe via global cache)
  //   • Production on a persistent Node.js / PM2 server
  // NOTE: Do NOT create a new client per invocation here — that exhausts
  // the MongoDB Atlas free-tier 500-connection limit very quickly.
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise().catch((err) => {
      // Clear the cache so the next request tries a fresh connection
      global._mongoClientPromise = undefined;
      throw err;
    });
  }
  return global._mongoClientPromise;
}

export async function getDb() {
  const dbName = process.env.MONGODB_DB || 'content_automation_db';
  const client = await getClientPromise();
  return client.db(dbName);
}
