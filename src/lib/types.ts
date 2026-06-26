// lib/types.ts
export type Platform = 'X' | 'LinkedIn' | 'Instagram';

export type ContentDraftStatus =
  | 'pending_noa'
  | 'rejected_noa'
  | 'approved_noa'
  | 'rejected_permanently'
  | 'posted';

export type VideoDraftStatus =
  | 'pending_noa_prompt'
  | 'rejected_noa_prompt'
  | 'generating_video'
  | 'pending_noa_video'
  | 'rejected_noa_video'
  | 'approved_noa'
  | 'posted';

export type GenerationStage =
  | 'agent_1'
  | 'agent_2'
  | 'agent_3'
  | 'agent_4'
  | 'agent_5'
  | 'higgsfield'
  | 'socialbee'
  | 'complete';

export interface ContentDraft {
  _id?: string;
  jobId: string;
  contentType: 'text';
  draftTitle?: string;
  draftShortDescription?: string;
  agent1Output?: string;
  agent2Output?: string;
  agent3Output?: string;
  agent4Output?: string;
  agent5Output?: string;
  finalDraft: Record<string, { postText?: string; caption?: string } & Record<string, unknown>> | string;
  platformStatuses?: Record<string, string>;
  platformFeedbacks?: Record<string, string>;
  draftStatus: string;
  generationStage?: string;
  platform?: Platform;
  iterationCount: number;
  noaFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoDraft {
  _id?: string;
  jobId: string;
  contentType: 'video';
  agent1Output?: string;
  agent2Output?: string;
  agent3Output?: string;
  agent4Output?: string;
  finalDraft: string;
  videoUrl?: string;
  videoThumbnailUrl?: string;
  draftStatus: VideoDraftStatus;
  generationStage?: GenerationStage;
  iterationCount: number;
  noaPromptFeedback?: string;
  noaVideoFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export type AnyDraft = ContentDraft | VideoDraft;
