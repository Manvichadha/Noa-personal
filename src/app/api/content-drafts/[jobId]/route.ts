// src/app/api/content-drafts/[jobId]/route.ts
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
    const collection = db.collection('content_drafts');

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.draftStatus !== undefined) updateFields.draftStatus = body.draftStatus;
    if (body.noaFeedback !== undefined) updateFields.noaFeedback = body.noaFeedback;
    if (body.founderFeedback !== undefined) updateFields.founderFeedback = body.founderFeedback;
    if (body.founderAction !== undefined) updateFields.founderAction = body.founderAction;
    if (body.generationStage !== undefined) updateFields.generationStage = body.generationStage;

    if (body.platformStatuses) {
      for (const [key, val] of Object.entries(body.platformStatuses)) {
        updateFields[`platformStatuses.${key}`] = val;
      }
    }
    if (body.platformFeedbacks) {
      for (const [key, val] of Object.entries(body.platformFeedbacks)) {
        updateFields[`platformFeedbacks.${key}`] = val;
      }
    }

    const result = await collection.findOneAndUpdate(
      { jobId },
      { $set: updateFields },
      { returnDocument: 'after', sort: { updatedAt: -1 } }
    );

    if (!result) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // ── Auto-derive top-level draftStatus from ALL platforms ──
    // Because n8n creates new documents for partial updates, we must look at the
    // FULL MERGED history of this jobId to know which platforms actually exist.
    if (body.platformStatuses && !body.draftStatus) {
      const allDocs = await collection.find({ jobId }).sort({ updatedAt: -1 }).toArray();
      
      const mergedFD: Record<string, any> = {};
      const mergedPS: Record<string, any> = {};
      
      // Merge from oldest to newest
      for (const doc of allDocs.reverse()) {
        if (doc.finalDraft) {
          for (const [k, v] of Object.entries(doc.finalDraft)) {
            if (v) mergedFD[k] = v;
          }
        }
        if (doc.platformStatuses) {
          for (const [k, v] of Object.entries(doc.platformStatuses)) {
            if (v) mergedPS[k] = v;
          }
        }
      }

      // Discover all platforms that have content in the MERGED state
      const platformKeys = new Set<string>();
      for (const k of ['linkedin', 'x', 'instagram', 'carousel']) {
        if (mergedFD[k]) platformKeys.add(k);
      }
      for (const k of Object.keys(mergedPS)) {
        platformKeys.add(k);
      }

      const resolveStatus = (v: any): string => {
        if (!v) return 'ready_for_noa_review'; // no entry = still pending
        if (typeof v === 'string') {
          if (v === 'noa_edit_requested' || v === 'pending_noa_review') return 'ready_for_noa_review';
          return v;
        }
        if (typeof v === 'object') {
          if (v.founderStatus === 'approved' || v.founderStatus === 'approved_by_founder') return 'approved_founders';
          if (v.founderStatus === 'rejected' || v.founderStatus === 'rejected_by_founder') return 'rejected_founders';
          if (v.founderStatus === 'revision_requested' || v.founderStatus === 'commented') return 'revision_requested_founders';
          if (v.founderStatus && v.founderStatus !== 'not_started') return v.founderStatus;

          if (v.postingStatus === 'posted') return 'posted';
          if (v.postingStatus === 'scheduled') return 'scheduled';

          if (v.noaStatus === 'pending_noa_review') return 'ready_for_noa_review';
          if (v.noaStatus === 'approved' || v.noaStatus === 'approved_by_noa') return 'pending_founders';
          if (v.noaStatus === 'rejected' || v.noaStatus === 'rejected_by_noa') return 'rejected_noa';
          if (v.noaStatus === 'edit_requested' || v.noaStatus === 'noa_edit_requested') return 'rejected_noa';
          if (v.noaStatus === 'rejected_permanently') return 'rejected_permanently';
          if (v.noaStatus) return v.noaStatus;
        }
        return 'ready_for_noa_review';
      };

      const allStatuses = Array.from(platformKeys).map(k => resolveStatus(mergedPS[k]));

      let derivedStatus = 'ready_for_noa_review';
      if (allStatuses.length > 0) {
        if (allStatuses.includes('ready_for_noa_review')) derivedStatus = 'ready_for_noa_review';
        else if (allStatuses.includes('rejected_noa')) derivedStatus = 'rejected_noa';
        else if (allStatuses.includes('revision_requested_founders')) derivedStatus = 'revision_requested_founders';
        else if (allStatuses.includes('pending_founders')) derivedStatus = 'pending_founders';
        else if (allStatuses.includes('rejected_founders')) derivedStatus = 'rejected_founders';
        else if (allStatuses.includes('approved_founders')) derivedStatus = 'approved_founders';
        else if (allStatuses.includes('posted')) derivedStatus = 'posted';
        else derivedStatus = allStatuses[0]; 
      }

      // Update ALL documents for this jobId with the newly derived overall status
      await collection.updateMany(
        { jobId },
        { $set: { draftStatus: derivedStatus } }
      );
      result.draftStatus = derivedStatus;
    }
    return NextResponse.json({ ...result, _id: result._id.toString() });
  } catch (err) {
    console.error('PATCH /api/content-drafts/[jobId] error:', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
