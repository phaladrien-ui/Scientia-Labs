// agents/researcher/research-types.ts

export type SourceType =
  | "primary"
  | "secondary"
  | "tertiary"
  | "unknown";

export interface ResearchSource {
  readonly title: string;
  readonly url: string;
  readonly snippet: string;
  evaluation?: SourceEvaluation;
}

export interface SourceEvaluation {
  readonly score: number;
  readonly sourceType: SourceType;
  readonly credibility: number;
  readonly relevance: number;
  readonly evidenceQuality: number;
  readonly recency: number;
  readonly reasoning: string;
}

export interface ResearchRequest {
  readonly question: string;
  readonly sources?: {
    include?: string[];    // Sources obligatoires
    exclude?: string[];    // Sources interdites
    preferred?: string[];  // Sources prioritaires
  };
}

export interface ResearchResult {
  readonly question: string;
  readonly status: "completed";
  readonly summary: string;
  readonly sources: readonly ResearchSource[];
}