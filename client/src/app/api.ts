export type IndexStatus = 'PENDING' | 'INDEXING' | 'READY' | 'FAILED';

export type User = {
  id: string;
  githubId: number;
  githubUsername: string;
  displayName: string;
  avatarUrl: string | null;
};

export type Repository = {
  id: string;
  githubRepoId: number;
  owner: string;
  name: string;
  fullName: string;
  isPrivate: boolean;
  defaultBranch: string;
  language: string | null;
  htmlUrl: string | null;
  description: string | null;
  indexStatus: IndexStatus;
  indexedAt: string | null;
  chunkCount: number;
  filesTotal: number;
  filesProcessed: number;
  errorMessage: string | null;
};

export type IndexStatusResponse = {
  repositoryId: string;
  indexStatus: IndexStatus;
  filesTotal: number;
  filesProcessed: number;
  chunkCount: number;
  indexedAt: string | null;
  errorMessage: string | null;
};

export type ChatSession = {
  id: string;
  repositoryId: string;
  title: string;
  createdAt: string;
};

export type Citation = {
  filePath: string;
  startLine: number | null;
  endLine: number | null;
  language: string | null;
};

export type ChatMessage = {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  citations: Citation[];
  createdAt: string;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function getApiBaseUrl(): string {
  // In Angular we usually put this in environment files
  return 'http://localhost:8080'; // fallback for local
}

export function getGithubLoginUrl(): string {
  return `${getApiBaseUrl()}/oauth2/authorization/github`;
}
