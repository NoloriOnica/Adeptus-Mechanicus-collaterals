export type SessionStatus = 'idle' | 'pending' | 'done' | 'error';

export interface StatusResponse {
  status: SessionStatus;
  result?: string;
  updatedAt: number;
}

export interface SubmitRequest {
  confession: string;
}

export interface SubmitResponse {
  ok: boolean;
  submissionCount: number;
}
