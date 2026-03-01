import type { ProjectData, ProjectMeta, Track } from "../schemas/project.schema";
import type { Sample } from "../schemas/sample.schema";
import type { User, Plan } from "../schemas/user.schema";

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  data?: never;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// Project endpoints
export interface ListProjectsResponse {
  projects: ProjectMeta[];
}

export interface GetProjectResponse {
  project: ProjectMeta & { data: ProjectData };
}

export interface CreateProjectResponse {
  project: ProjectMeta;
}

// Sample endpoints
export interface ListSamplesResponse {
  samples: Sample[];
}

export interface GetUploadUrlResponse {
  uploadUrl: string;
  storageKey: string;
  publicUrl: string;
}

// User endpoints
export interface GetMeResponse {
  user: User;
  plan: Plan;
  aiGenerationsUsed: number;
  aiGenerationsLimit: number;
}

// AI endpoints
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  projectContext?: {
    bpm: number;
    key: string;
    scale: string;
    trackCount: number;
  };
}

// Billing endpoints
export interface CreateCheckoutSessionResponse {
  url: string;
}

export interface CreatePortalSessionResponse {
  url: string;
}
