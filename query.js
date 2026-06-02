const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('content_automation_db');
  
  const counts = await db.collection('content_drafts').aggregate([
    { $group: { _id: "$draftStatus", count: { $sum: 1 } } }
  ]).toArray();
  
  console.log("Draft Statuses:", counts);
  await client.close();
}
run();
