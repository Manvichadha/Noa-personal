/* eslint-disable @typescript-eslint/no-require-imports */
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('content_automation_db');
    
    const count = await db.collection('content_drafts').countDocuments();
    console.log("Total content drafts in DB:", count);

    const statuses = await db.collection('content_drafts').aggregate([
      { $group: { _id: "$draftStatus", count: { $sum: 1 } } }
    ]).toArray();
    console.log("Draft statuses:", JSON.stringify(statuses, null, 2));

    const docs = await db.collection('content_drafts').find().limit(5).toArray();
    console.log("Sample documents (first 5):");
    docs.forEach(d => {
      console.log(`- jobId: ${d.jobId}, draftStatus: ${d.draftStatus}, platformStatuses: ${JSON.stringify(d.platformStatuses)}`);
    });
  } finally {
    await client.close();
  }
}
run();
