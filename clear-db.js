const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function clearPlaceholders() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('noa_content_pipeline');
    
    const res1 = await db.collection('content_drafts').deleteMany({ jobId: { $regex: '^job_' } });
    console.log('Deleted ' + res1.deletedCount + ' text drafts');
    
    const res2 = await db.collection('video_drafts').deleteMany({ jobId: { $regex: '^job_' } });
    console.log('Deleted ' + res2.deletedCount + ' video drafts');
  } finally {
    await client.close();
  }
}
clearPlaceholders();
