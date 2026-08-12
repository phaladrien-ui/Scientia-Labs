import type { Agent } from "../agent";
import type { AgentContext } from "../agent-context";

import type {
  ResearchRequest,
  ResearchResult,
  ResearchSource
} from "./research-types";

import type { WebSearchOutput } from "../../capabilities/web-search/types";

import { SourceEvaluator } from "./source-evaluator";

import {
  ResearchGapAnalyzer,
  type ResearchGap
} from "./research-gap-analyzer";

const MAX_RESEARCH_ITERATIONS = 3;
const MAX_SOURCES = 15;
const MAX_GAP_SEARCHES = 5;

export class ResearcherAgent implements Agent {
  readonly id = "researcher";
  readonly type = "researcher";

  private context: AgentContext | null = null;

  async initialize(
    context: AgentContext
  ): Promise<void> {
    this.context = context;
  }

  async execute(
    input: unknown
  ): Promise<ResearchResult> {
    if (!this.context) {
      throw new Error(
        "Researcher has not been initialized"
      );
    }

    const request = input as ResearchRequest;

    if (!request.question?.trim()) {
      throw new Error(
        "Research question cannot be empty"
      );
    }

    const webSearch =
      this.context.capabilities.get(
        "web.search"
      );

    if (!webSearch) {
      throw new Error(
        "Web search capability is not available"
      );
    }

    const llm =
      this.context.llmProviders.get(
        "deepseek"
      );

    if (!llm) {
      throw new Error(
        "DeepSeek provider is not available"
      );
    }

    const sourceEvaluator =
      new SourceEvaluator(llm);

    const gapAnalyzer =
      new ResearchGapAnalyzer(llm);

    const sources =
      new Map<string, ResearchSource>();

    let currentQuery =
      request.question;

    // ============================================================
    // PHASE 1 — INITIAL RESEARCH
    // ============================================================

    for (
      let iteration = 0;
      iteration < MAX_RESEARCH_ITERATIONS;
      iteration++
    ) {
      console.log(
        `[Researcher] Research iteration ${
          iteration + 1
        }/${MAX_RESEARCH_ITERATIONS}`
      );

      console.log(
        `[Researcher] Searching: ${currentQuery}`
      );

      try {
        const searchResult =
          (await webSearch.execute({
            query: currentQuery
          })) as WebSearchOutput;

        if (
          !searchResult ||
          !Array.isArray(searchResult.results)
        ) {
          console.warn(
            "[Researcher] Web search returned no valid results."
          );

          continue;
        }

        for (const result of searchResult.results) {
          if (
            !result ||
            typeof result.url !== "string" ||
            !result.url.trim()
          ) {
            continue;
          }

          const normalizedUrl =
            result.url
              .toLowerCase()
              .replace(/\/$/, "");

          if (!sources.has(normalizedUrl)) {
            sources.set(
              normalizedUrl,
              {
                title: result.title ?? "Untitled source",
                url: result.url,
                snippet: result.snippet ?? ""
              }
            );
          }

          if (
            sources.size >=
            MAX_SOURCES
          ) {
            break;
          }
        }
      } catch (error) {
        console.error(
          `[Researcher] Search failed: ${currentQuery}`,
          error
        );
      }

      console.log(
        `[Researcher] Sources collected: ${sources.size}`
      );

      if (
        sources.size >=
        MAX_SOURCES
      ) {
        console.log(
          "[Researcher] Source limit reached."
        );

        break;
      }

      currentQuery =
        `${request.question} latest research findings evidence`;
    }

    if (sources.size === 0) {
      throw new Error(
        "No web search results found"
      );
    }

    // ============================================================
    // PHASE 2 — SOURCE EVALUATION
    // ============================================================

    const sourceList =
      Array.from(sources.values());

    console.log(
      `[Researcher] Evaluating ${sourceList.length} sources...`
    );

    for (const source of sourceList) {
      console.log(
        `[Researcher] Evaluating: ${source.title}`
      );

      try {
        source.evaluation =
          await sourceEvaluator.evaluate(
            source,
            request.question
          );
      } catch (error) {
        console.error(
          `[Researcher] Failed to evaluate source: ${source.title}`,
          error
        );
      }
    }

    // ============================================================
    // PHASE 3 — INITIAL SOURCE RANKING
    // ============================================================

    sourceList.sort(
      (a, b) =>
        (b.evaluation?.score ?? 0) -
        (a.evaluation?.score ?? 0)
    );

    console.log(
      "[Researcher] Source ranking:"
    );

    for (const source of sourceList) {
      console.log(
        `${source.evaluation?.score ?? 0}/100 - ${source.title}`
      );
    }

    // ============================================================
    // PHASE 4 — IDENTIFY RESEARCH GAPS
    // ============================================================

    console.log(
      "[Researcher] Analyzing research gaps..."
    );

    let gapAnalysis;

    try {
      gapAnalysis =
        await gapAnalyzer.analyze(
          request.question,
          sourceList
        );
    } catch (error) {
      console.error(
        "[Researcher] Research gap analysis failed:",
        error
      );

      gapAnalysis = {
        gaps: []
      };
    }

    console.log(
      `[Researcher] Research gaps detected: ${gapAnalysis.gaps.length}`
    );

    for (const gap of gapAnalysis.gaps) {
      console.log(
        `[Researcher] Gap (${gap.priority}): ${gap.claim}`
      );

      console.log(
        `[Researcher] Problem: ${gap.problem}`
      );

      for (const query of gap.searchQueries) {
        console.log(
          `[Researcher] Suggested search: ${query}`
        );
      }
    }

    // ============================================================
    // PHASE 5 — TARGETED FOLLOW-UP RESEARCH
    // ============================================================

    const highPriorityGaps =
      gapAnalysis.gaps
        .filter(
          (gap) =>
            gap.priority === "high" ||
            gap.priority === "medium"
        )
        .slice(
          0,
          MAX_GAP_SEARCHES
        );

    for (const gap of highPriorityGaps) {
      await this.executeGapResearch(
        gap,
        webSearch,
        sources
      );
    }

    // ============================================================
    // PHASE 6 — EVALUATE NEW SOURCES
    // ============================================================

    const updatedSourceList =
      Array.from(sources.values());

    console.log(
      `[Researcher] Evaluating new sources. Total: ${updatedSourceList.length}`
    );

    for (const source of updatedSourceList) {
      if (source.evaluation) {
        continue;
      }

      console.log(
        `[Researcher] Evaluating new source: ${source.title}`
      );

      try {
        source.evaluation =
          await sourceEvaluator.evaluate(
            source,
            request.question
          );
      } catch (error) {
        console.error(
          `[Researcher] Failed to evaluate new source: ${source.title}`,
          error
        );
      }
    }

    // ============================================================
    // PHASE 7 — FINAL RANKING
    // ============================================================

    updatedSourceList.sort(
      (a, b) =>
        (b.evaluation?.score ?? 0) -
        (a.evaluation?.score ?? 0)
    );

    console.log(
      "[Researcher] Final source ranking:"
    );

    for (const source of updatedSourceList) {
      console.log(
        `${source.evaluation?.score ?? 0}/100 - ${source.title}`
      );
    }

    // ============================================================
    // PHASE 8 — SYNTHESIS
    // ============================================================

    const researchContext =
      updatedSourceList
        .map(
          (source, index) =>
            `Source ${index + 1}
Title: ${source.title}
URL: ${source.url}
Content: ${source.snippet}

Evaluation:
Score: ${source.evaluation?.score ?? "unknown"}/100
Type: ${source.evaluation?.sourceType ?? "unknown"}
Credibility: ${source.evaluation?.credibility ?? "unknown"}/100
Relevance: ${source.evaluation?.relevance ?? "unknown"}/100
Evidence quality: ${source.evaluation?.evidenceQuality ?? "unknown"}/100
Recency: ${source.evaluation?.recency ?? "unknown"}/100
Reasoning: ${source.evaluation?.reasoning ?? "unknown"}`
        )
        .join("\n\n");

    const response =
      await llm.generate({
        messages: [
          {
            role: "system",
            content:
              "You are the scientific research agent of Scientia Labs. " +
              "Produce a rigorous evidence-aware scientific synthesis. " +
              "Prioritize high-quality sources, especially primary research. " +
              "Do not treat weak sources as established evidence. " +
              "Clearly distinguish established findings, preliminary claims, " +
              "and speculation. Cite sources using Source 1, Source 2, etc. " +
              "Never invent evidence. " +
              "If a claim is insufficiently supported, explicitly say so."
          },
          {
            role: "user",
            content:
              `Research question:
${request.question}

Research gaps identified:

${gapAnalysis.gaps
  .map(
    (gap, index) =>
      `${index + 1}. ${gap.claim}
Problem: ${gap.problem}
Priority: ${gap.priority}
Search queries: ${gap.searchQueries.join(", ")}`
  )
  .join("\n\n")}

Collected sources:

${researchContext}

Produce the final rigorous scientific synthesis.`
          }
        ],
        temperature: 0.2
      });

    return {
      question: request.question,
      status: "completed",
      summary: response.content,
      sources: updatedSourceList.map(
        (source) => ({
          title: source.title,
          url: source.url,
          snippet: source.snippet,
          evaluation: source.evaluation
        })
      )
    };
  }

  private async executeGapResearch(
    gap: ResearchGap,
    webSearch: {
      execute(
        input: unknown
      ): Promise<unknown>;
    },
    sources: Map<
      string,
      ResearchSource
    >
  ): Promise<void> {
    for (const query of gap.searchQueries) {
      if (
        sources.size >=
        MAX_SOURCES
      ) {
        console.log(
          "[Researcher] Maximum source limit reached during gap research."
        );

        return;
      }

      if (!query.trim()) {
        continue;
      }

      console.log(
        `[Researcher] Targeted research for gap: ${query}`
      );

      try {
        const searchResult =
          (await webSearch.execute({
            query
          })) as WebSearchOutput;

        if (
          !searchResult ||
          !Array.isArray(searchResult.results)
        ) {
          continue;
        }

        for (const result of searchResult.results) {
          if (
            !result ||
            typeof result.url !== "string" ||
            !result.url.trim()
          ) {
            continue;
          }

          const normalizedUrl =
            result.url
              .toLowerCase()
              .replace(/\/$/, "");

          if (!sources.has(normalizedUrl)) {
            sources.set(
              normalizedUrl,
              {
                title: result.title ?? "Untitled source",
                url: result.url,
                snippet: result.snippet ?? ""
              }
            );
          }

          if (
            sources.size >=
            MAX_SOURCES
          ) {
            break;
          }
        }
      } catch (error) {
        console.error(
          `[Researcher] Gap search failed: ${query}`,
          error
        );
      }
    }
  }

  async shutdown(): Promise<void> {
    this.context = null;
  }
}