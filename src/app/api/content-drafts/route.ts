// src/app/api/content-drafts/route.ts
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

import { getDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');

    const db = await getDb();
    const collection = db.collection('content_drafts');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, unknown> = {};

    if (status) {
      const statuses = status.split(',').map((s) => s.trim());
      if (statuses.includes('ready_for_noa_review')) statuses.push('pending_noa_review');
      if (statuses.includes('approved_noa')) statuses.push('approved_by_noa', 'approved');
      if (statuses.includes('rejected_permanently')) statuses.push('rejected_by_noa', 'rejected');
      if (statuses.includes('rejected_noa')) statuses.push('noa_edit_requested', 'edit_requested');

      const statusQuery = statuses.length === 1 ? statuses[0] : { $in: statuses };

      query.$or = [
        { draftStatus: statusQuery },
        { "platformStatuses.linkedin": statusQuery },
        { "platformStatuses.linkedin.noaStatus": statusQuery },
        { "platformStatuses.x": statusQuery },
        { "platformStatuses.x.noaStatus": statusQuery },
        { "platformStatuses.instagram": statusQuery },
        { "platformStatuses.instagram.noaStatus": statusQuery },
      ];
    }

    if (platform) query.platform = platform;

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
    // Group by jobId, sort each group newest-first
    const groups = docs.reduce<Record<string, typeof docs>>((acc, doc) => {
      const key = String(doc.jobId);
      if (!acc[key]) acc[key] = [];
      acc[key].push(doc);
      return acc;
    }, {});

    const merged = Object.values(groups).map(group => {
      if (group.length === 1) return group[0];

      // Sort: oldest first so that newer values overwrite older ones
      const sorted = [...group].sort(
        (a, b) =>
          (new Date((a.updatedAt || a.createdAt) as string).getTime() || 0) -
          (new Date((b.updatedAt || b.createdAt) as string).getTime() || 0)
      );

      // Base = most recently updated doc (scalar metadata)
      const base: Record<string, unknown> = { ...sorted[sorted.length - 1] } as Record<string, unknown>;

      // Deep-merge the per-platform objects
      const finalDraft: Record<string, unknown> = {};
      const platformStatuses: Record<string, unknown> = {};
      const platformFeedbacks: Record<string, unknown> = {};
      const platformReviewMeta: Record<string, unknown> = {};

      for (const doc of sorted) {
        if (doc.finalDraft && typeof doc.finalDraft === 'object') {
          for (const [platform, content] of Object.entries(doc.finalDraft)) {
            if (content) {
              const isObj = typeof content === 'object';
              const isEmptyStr = isObj && ((content as Record<string, unknown>).postText === '' || (content as Record<string, unknown>).caption === '');
              if (!isEmptyStr) finalDraft[platform] = content;
            }
          }
        }
        if (doc.platformStatuses && typeof doc.platformStatuses === 'object') {
          for (const [platform, status] of Object.entries(doc.platformStatuses)) {
            if (status) platformStatuses[platform] = status;
          }
        }
        if (doc.platformFeedbacks && typeof doc.platformFeedbacks === 'object') {
          for (const [platform, fb] of Object.entries(doc.platformFeedbacks)) {
            if (fb) platformFeedbacks[platform] = fb;
          }
        }
        if ((doc as Record<string, unknown>).platformReviewMeta && typeof (doc as Record<string, unknown>).platformReviewMeta === 'object') {
          for (const [platform, meta] of Object.entries((doc as Record<string, unknown>).platformReviewMeta as Record<string, unknown>)) {
            if (meta) platformReviewMeta[platform] = meta;
          }
        }
      }

      base.finalDraft = finalDraft;
      base.platformStatuses = platformStatuses;
      if (Object.keys(platformFeedbacks).length) base.platformFeedbacks = platformFeedbacks;
      if (Object.keys(platformReviewMeta).length) base.platformReviewMeta = platformReviewMeta;

      return base;
    });

    // Serialize _id to string
    const serialized = merged.map((d: any) => ({ ...d, _id: d._id.toString() }));
    return NextResponse.json(serialized);
  } catch (err) {
    console.error('GET /api/content-drafts error:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
