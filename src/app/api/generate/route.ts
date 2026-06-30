import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';



export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }

    const auth = authHeader.split(' ')[1];
    const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');
    if (user !== 'noa' || pwd !== 'noa2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const inputType = formData.get('inputType') as string;
    const inputContent = formData.get('inputContent') as string | null;
    const videoPrompt = formData.get('videoPrompt') as string | null;

    if (!inputType) {
      return NextResponse.json({ error: 'Missing inputType' }, { status: 400 });
    }

    // 1. Generate Job ID
    const jobId = `job_${Date.now()}`;

    // 2. Insert MongoDB Stub Document
    const db = await getDb();
    const collection = db.collection('content_drafts');
    
    await collection.insertOne({
      jobId,
      inputType,
      inputContent: inputContent || videoPrompt || null,
      contentType: 'text',
      draftTitle: `Generating from ${inputType.charAt(0).toUpperCase() + inputType.slice(1)}`,
      draftShortDescription: 'AI is analyzing your inputs and generating platform drafts...',
      draftStatus: 'generating',
      platformStatuses: {
        linkedin: 'generating',
        x: 'generating',
        instagram: 'generating'
      },
      iterationCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 3. Trigger n8n Webhook
    // Append the jobId so n8n knows exactly which document to update at the end of the pipeline
    formData.append('jobId', jobId);

    const webhookUrl = process.env.N8N_GENERATE_WEBHOOK || "http://168.144.71.48:5678/webhook/generate-content-trigger";

    // Forward the formData exactly as received (preserves binary files)
    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      body: formData,
    });

    if (!n8nResponse.ok) {
      console.warn("n8n Webhook returned error status:", n8nResponse.status);
    }

    return NextResponse.json({ success: true, jobId });
  } catch (err) {
    console.error('POST /api/generate error:', err);
    return NextResponse.json({ error: 'Failed to process generation request' }, { status: 500 });
  }
}
