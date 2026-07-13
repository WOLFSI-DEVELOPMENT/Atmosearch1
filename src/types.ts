export interface SearchSection {
  title: string;
  content: string;
  type: 'text' | 'list' | 'code' | 'data';
}

export interface SearchSource {
  uri: string;
  title: string;
}

export interface SearchResult {
  summary: string;
  sections: SearchSection[];
  relatedQueries: string[];
}

export interface SearchResponse {
  id: string | null;
  result: SearchResult;
  sources: SearchSource[];
  images?: string[];
  modelUsed?: string;
}

export interface MCPPlugin {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  mcpServerUrl: string;
  requiresAuth: boolean;
  authType?: string;
  createdAt: string;
  status: string;
}
