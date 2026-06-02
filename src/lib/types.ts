// lib/types.ts
export type Platform = 'X' | 'LinkedIn' | 'Instagram';

export type ContentDraftStatus =
  | 'pending_noa'
  | 'rejected_noa'
  | 'pending_founders'
  | 'revision_requested_founders'
  | 'approved_founders'
  | 'rejected_founders'
  | 'posted';

export type VideoDraftStatus =
  | 'pending_noa_prompt'
  | 'rejected_noa_prompt'
  | 'generating_video'
  | 'pending_noa_video'
  | 'rejected_noa_video'
  | 'pending_founders'
  | 'revision_requested_founders'
  | 'approved_founders'
  | 'rejected_founders'
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

export type FounderAction = 'approved' | 'commented' | 'disapproved';

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
  finalDraft: any; // Real DB has this as an object mapping platforms to content
  platformStatuses?: Record<string, string>;
  platformFeedbacks?: Record<string, string>;
  draftStatus: string;
  generationStage?: string;
  platform?: Platform; // Legacy
  iterationCount: number;
  noaFeedback?: string;
  founderFeedback?: string;
  founderAction?: FounderAction;
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
  founderFeedback?: string;
  founderAction?: FounderAction;
  createdAt: string;
  updatedAt: string;
}

export type AnyDraft = ContentDraft | VideoDraft;
