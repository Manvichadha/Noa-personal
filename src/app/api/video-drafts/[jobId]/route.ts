// src/app/api/video-drafts/[jobId]/route.ts
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

import { getDb } from '@/lib/mongodb';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await req.json();

    const db = await getDb();
    const collection = db.collection('video_prompt_drafts');

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.draftStatus !== undefined) updateFields.draftStatus = body.draftStatus;
    if (body.noaPromptFeedback !== undefined) updateFields.noaPromptFeedback = body.noaPromptFeedback;
    if (body.noaVideoFeedback !== undefined) updateFields.noaVideoFeedback = body.noaVideoFeedback;
    if (body.founderFeedback !== undefined) updateFields.founderFeedback = body.founderFeedback;
    if (body.founderAction !== undefined) updateFields.founderAction = body.founderAction;
    if (body.generationStage !== undefined) updateFields.generationStage = body.generationStage;

    const result = await collection.findOneAndUpdate(
      { jobId },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ ...result, _id: result._id.toString() });
  } catch (err) {
    console.error('PATCH /api/video-drafts/[jobId] error:', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
