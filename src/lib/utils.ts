// src/lib/utils.ts

export function getPlatformStatus(statusVal: unknown, defaultStatus: string): string {
  if (!statusVal) return defaultStatus;
  if (typeof statusVal === 'string') {
    // Normalise n8n status aliases → dashboard status names
    if (statusVal === 'noa_edit_requested' || statusVal === 'edit_requested') return 'rejected_noa';
    if (statusVal === 'pending_noa_review') return 'ready_for_noa_review';
    if (statusVal === 'approved_by_noa' || statusVal === 'approved' || statusVal === 'approved_noa') return 'approved_noa';
    if (statusVal === 'rejected_by_noa' || statusVal === 'rejected' || statusVal === 'rejected_permanently') return 'rejected_permanently';
    return statusVal;
  }
  if (typeof statusVal === 'object' && statusVal !== null) {
    const val = statusVal as Record<string, string | undefined>;
    const noa = val.noaStatus;
    const posting = val.postingStatus;

    // ── Posting layer ──
    if (posting === 'posted') return 'posted';
    if (posting === 'scheduled') return 'scheduled';

    // ── Noa layer (final decision maker) ──
    if (noa === 'pending_noa_review') return 'ready_for_noa_review';
    if (noa === 'approved' || noa === 'approved_by_noa' || noa === 'approved_noa') return 'approved_noa';
    if (noa === 'rejected' || noa === 'rejected_permanently' || noa === 'rejected_by_noa') return 'rejected_permanently';
    if (noa === 'edit_requested' || noa === 'noa_edit_requested') return 'rejected_noa';
    if (noa) return noa;
  }
  return defaultStatus;
}
