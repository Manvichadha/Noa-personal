// scripts/seed.ts
// Run with: npx tsx scripts/seed.ts
// Requires .env.local to be configured with MONGODB_URI and MONGODB_DB
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || 'noa_content_pipeline';

if (!uri) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

const now = new Date().toISOString();
const ago = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000).toISOString();

const contentDrafts = [
  {
    jobId: 'job_text_001',
    contentType: 'text',
    finalDraft: `🚀 The future of content isn't written — it's generated, reviewed, and refined.\n\nAt Antigravity, we've built a full AI pipeline that:\n• Categorises raw inputs in seconds\n• Generates platform-native hooks\n• Checks brand compliance automatically\n• Routes everything through human review\n\nThe result? Content that moves fast without losing quality.\n\n#AI #ContentMarketing #BuildInPublic`,
    draftStatus: 'pending_noa',
    generationStage: 'complete',
    platform: 'LinkedIn',
    iterationCount: 0,
    createdAt: ago(30),
    updatedAt: ago(5),
  },
  {
    jobId: 'job_text_002',
    contentType: 'text',
    finalDraft: `Most AI tools replace humans. Ours keeps humans in control.\n\nEvery piece of content goes through:\n1. AI generation\n2. Human review (Noa)\n3. Founder approval\n4. Auto-posting\n\nThe best of both worlds. 🤝`,
    draftStatus: 'pending_noa',
    generationStage: 'complete',
    platform: 'X',
    iterationCount: 1,
    noaFeedback: 'Make it punchier, lead with the human angle',
    createdAt: ago(60),
    updatedAt: ago(8),
  },
  {
    jobId: 'job_text_003',
    contentType: 'text',
    finalDraft: `Building a content machine that scales:\n\n→ N8N orchestrates the pipeline\n→ 5 AI agents refine each piece\n→ Human review at every gate\n→ SocialBee handles distribution\n\nWe ship content daily. Zero burnout.\n\n#Automation #StartupLife`,
    draftStatus: 'pending_founders',
    generationStage: 'complete',
    platform: 'X',
    iterationCount: 0,
    createdAt: ago(120),
    updatedAt: ago(45),
  },
  {
    jobId: 'job_text_004',
    contentType: 'text',
    finalDraft: `What if your content team never slept?\n\nOur AI pipeline runs 24/7, producing platform-optimised drafts ready for review the moment you open your laptop.\n\nThe human touch still matters — but now it's focused on decisions, not drafting.\n\n#ProductivityHack #AITools #ContentStrategy`,
    draftStatus: 'approved_founders',
    generationStage: 'complete',
    platform: 'Instagram',
    iterationCount: 2,
    founderAction: 'approved',
    createdAt: ago(240),
    updatedAt: ago(120),
  },
  {
    jobId: 'job_text_005',
    contentType: 'text',
    finalDraft: `Hot take: most "AI content" feels robotic because humans aren't in the loop.\n\nWe disagree. Here's our approach:\n✅ AI generates at scale\n✅ Noa reviews for quality\n✅ Founders approve for brand\n✅ SocialBee posts at optimal times\n\nThe result reads human. Because it is.`,
    draftStatus: 'revision_requested_founders',
    generationStage: 'complete',
    platform: 'LinkedIn',
    iterationCount: 1,
    founderFeedback: 'Love the angle but can we be more specific about the results? Add a data point if possible.',
    founderAction: 'commented',
    createdAt: ago(180),
    updatedAt: ago(90),
  },
];

const videoDrafts = [
  {
    jobId: 'job_video_001',
    contentType: 'video',
    finalDraft: `A sleek dark office environment. A glowing laptop screen displaying a content pipeline flowchart. Text overlay: "Your content, automated." Camera slowly zooms in. Cinematic lighting. Corporate tech aesthetic. 4K. Photorealistic.`,
    draftStatus: 'pending_noa_prompt',
    generationStage: 'complete',
    iterationCount: 0,
    createdAt: ago(20),
    updatedAt: ago(3),
  },
  {
    jobId: 'job_video_002',
    contentType: 'video',
    finalDraft: `A futuristic AI interface with glowing purple and blue nodes representing a content pipeline. Each node lights up as data flows through. Abstract, high-tech, clean. Text: "5 agents. One pipeline. Infinite content." Dramatic orchestral music. 4K.`,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoThumbnailUrl: '',
    draftStatus: 'pending_noa_video',
    generationStage: 'complete',
    iterationCount: 0,
    createdAt: ago(90),
    updatedAt: ago(30),
  },
  {
    jobId: 'job_video_003',
    contentType: 'video',
    finalDraft: `Aerial drone shot over a modern city at golden hour. Text overlay fades in: "Building the future of content." Pan across skyline. Cut to close-up of hands typing on a keyboard. Warm, aspirational tone. Cinematic grading.`,
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    draftStatus: 'pending_founders',
    generationStage: 'complete',
    iterationCount: 1,
    noaVideoFeedback: 'Looks great! The lighting and pacing are perfect.',
    createdAt: ago(300),
    updatedAt: ago(180),
  },
  {
    jobId: 'job_video_004',
    contentType: 'video',
    finalDraft: `Time-lapse of a city waking up. Morning light. Coffee cup in foreground. A laptop opens. Content dashboard appears. Text: "Start every morning with a full queue." Warm, energising mood. Lifestyle aesthetic.`,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    draftStatus: 'approved_founders',
    generationStage: 'complete',
    iterationCount: 0,
    founderAction: 'approved',
    createdAt: ago(480),
    updatedAt: ago(240),
  },
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`✓ Connected to MongoDB: ${dbName}`);

    // Upsert content drafts
    const contentCol = db.collection('content_drafts');
    for (const doc of contentDrafts) {
      await contentCol.updateOne({ jobId: doc.jobId }, { $set: doc }, { upsert: true });
      console.log(`  ↑ Upserted content draft: ${doc.jobId}`);
    }

    // Upsert video drafts
    const videoCol = db.collection('video_prompt_drafts');
    for (const doc of videoDrafts) {
      await videoCol.updateOne({ jobId: doc.jobId }, { $set: doc }, { upsert: true });
      console.log(`  ↑ Upserted video draft: ${doc.jobId}`);
    }

    console.log('\n✅ Seed complete!');
    console.log(`   ${contentDrafts.length} content drafts`);
    console.log(`   ${videoDrafts.length} video drafts`);
    console.log('\n🚀 Run `npm run dev` and open http://localhost:3000');
  } finally {
    await client.close();
  }
}

seed().catch(console.error);
