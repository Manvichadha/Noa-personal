/* eslint-disable @typescript-eslint/no-require-imports */
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('content_automation_db');
    const drafts = await db.collection('content_drafts').find().limit(3).toArray();
    console.log(JSON.stringify(drafts, null, 2));
  } finally {
    await client.close();
  }
}
run();
