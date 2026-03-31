export type SessionStatus = 'idle' | 'pending' | 'done' | 'error';

export interface StatusResponse {
  status: SessionStatus;
  result?: string;
  updatedAt: number;
  inputLocked: boolean;
  inputOwnedByClient?: boolean;
}

export interface SubmitRequest {
  confession: string;
  clientId: string;
}

export interface SubmitResponse {
  ok: boolean;
  submissionCount: number;
}

export interface InputLockRequest {
  clientId: string;
}

export interface InputLockResponse {
  ok: boolean;
  claimed: boolean;
}
