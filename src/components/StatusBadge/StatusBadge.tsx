'use client';
// src/components/StatusBadge/StatusBadge.tsx
import { ContentDraftStatus, VideoDraftStatus, GenerationStage } from '@/lib/types';

type AnyStatus = ContentDraftStatus | VideoDraftStatus | GenerationStage;

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ready_for_noa_review:         { label: 'Ready for Review',  className: 'badge-pending-noa' },
  pending_noa:                  { label: 'Pending Noa',       className: 'badge-pending-noa' },
  rejected_noa:                 { label: 'Rejected by Noa',   className: 'badge-rejected' },
  pending_noa_prompt:           { label: 'Pending Noa',       className: 'badge-pending-noa' },
  rejected_noa_prompt:          { label: 'Prompt Rejected',   className: 'badge-rejected' },
  generating_video:             { label: 'Generating Video',  className: 'badge-generating' },
  pending_noa_video:            { label: 'Video Review',      className: 'badge-pending-noa' },
  rejected_noa_video:           { label: 'Video Rejected',    className: 'badge-rejected' },
  pending_founders:             { label: 'Pending Founders',  className: 'badge-pending-founders' },
  revision_requested_founders:  { label: 'Revision Req.',     className: 'badge-revision' },
  approved_founders:            { label: 'Approved',          className: 'badge-approved' },
  rejected_founders:            { label: 'Rejected',          className: 'badge-rejected' },
  posted:                       { label: 'Posted',            className: 'badge-posted' },
  // generation stages
  agent_1:    { label: 'Agent 1 Running', className: 'badge-generating' },
  agent_2:    { label: 'Agent 2 Running', className: 'badge-generating' },
  agent_3:    { label: 'Agent 3 Running', className: 'badge-generating' },
  agent_4:    { label: 'Agent 4 Running', className: 'badge-generating' },
  agent_5:    { label: 'Agent 5 Running', className: 'badge-generating' },
  higgsfield: { label: 'Higgsfield',      className: 'badge-generating' },
  socialbee:  { label: 'SocialBee',       className: 'badge-generating' },
  complete:   { label: 'Complete',        className: 'badge-approved' },
};

interface StatusBadgeProps {
  status: AnyStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'badge-pending-noa' };
  return (
    <span className={`badge ${config.className}`}>
      <span className="badge-dot" />
      {config.label}
    </span>
  );
}
