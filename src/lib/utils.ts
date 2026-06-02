// src/lib/utils.ts

export function getPlatformStatus(statusVal: any, defaultStatus: string): string {
  if (!statusVal) return defaultStatus;
  if (typeof statusVal === 'string') {
    // Normalise n8n status aliases → dashboard status names
    if (statusVal === 'noa_edit_requested') return 'rejected_noa';
    if (statusVal === 'pending_noa_review') return 'ready_for_noa_review';
    return statusVal;
  }
  if (typeof statusVal === 'object') {
    const noa = statusVal.noaStatus;
    const founder = statusVal.founderStatus;
    const posting = statusVal.postingStatus;

    // ── Founder layer (highest priority if resolved) ──
    if (founder === 'approved' || founder === 'approved_by_founder') return 'approved_founders';
    if (founder === 'rejected' || founder === 'rejected_by_founder') return 'rejected_founders';
    if (founder === 'revision_requested' || founder === 'commented') return 'revision_requested_founders';
    if (founder === 'pending_founder_review' || founder === 'pending_founders') return 'pending_founders';
    if (founder && founder !== 'not_started') return founder;

    // ── Posting layer ──
    if (posting === 'posted') return 'posted';
    if (posting === 'scheduled') return 'scheduled';

    // ── Noa layer ──
    if (noa === 'pending_noa_review') return 'ready_for_noa_review';
    if (noa === 'approved' || noa === 'approved_by_noa') return 'pending_founders';
    if (noa === 'rejected' || noa === 'rejected_permanently' || noa === 'rejected_by_noa') return 'rejected_permanently';
    if (noa === 'edit_requested' || noa === 'noa_edit_requested') return 'rejected_noa';
    if (noa) return noa;
  }
  return defaultStatus;
}
