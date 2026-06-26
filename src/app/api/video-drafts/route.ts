// src/app/api/video-drafts/route.ts
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

import { getDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const hasVideo = searchParams.get('hasVideo');

    const db = await getDb();
    const collection = db.collection('video_prompt_drafts');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, unknown> = {};

    if (status) {
      const statuses = status.split(',').map((s) => s.trim());
      if (statuses.includes('ready_for_noa_review')) statuses.push('pending_noa_review');
      if (statuses.includes('approved_noa')) statuses.push('approved_by_noa', 'approved');
      if (statuses.includes('rejected_permanently')) statuses.push('rejected_by_noa', 'rejected');
      if (statuses.includes('rejected_noa')) statuses.push('noa_edit_requested', 'edit_requested');
      
      query.draftStatus = statuses.length === 1 ? statuses[0] : { $in: statuses };
    }
    if (hasVideo === 'true') {
      query.videoUrl = { $exists: true, $nin: [null, ''] };
    }


    // 1. Find all jobIds that match the status filter
    const initialDocs = await collection.find(query, { projection: { jobId: 1 } }).toArray();
    const matchingJobIds = Array.from(new Set(initialDocs.map(d => String(d.jobId))));

    if (matchingJobIds.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Fetch ALL documents for those jobIds so we have the full history for merging
    const docs = await collection
      .find({ jobId: { $in: matchingJobIds } })
      .sort({ updatedAt: -1 })
      .toArray();

    // ── Merge all docs with the same jobId ──────────────────────────────────
    const groups = docs.reduce<Record<string, typeof docs>>((acc, doc) => {
      const key = String(doc.jobId);
      if (!acc[key]) acc[key] = [];
      acc[key].push(doc);
      return acc;
    }, {});

    const serialized = Object.values(groups).map((group) => {
      const latest = group[0];
      return { ...latest, _id: latest._id.toString(), history: group.map((d) => ({ ...d, _id: d._id.toString() })) };
    });

    return NextResponse.json(serialized);
  } catch (err) {
    console.error('GET /api/video-drafts error:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
