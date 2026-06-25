// lib/ai/tools/calculate.ts

/**
 * Scientia Labs — Calculate Tool
 * Outil de calcul scientifique pour l'IA
 */

import { tool } from "ai";
import { z } from "zod";
import { computationEngine } from "@/lib/ai/computation-engine";
import type { ComputationType } from "@/lib/ai/computation-engine/core/types";

const validTypes = [
  "evaluate", "derivative", "integral", "limit", "solve",
  "system", "determinant", "inverse", "eigenvalues",
  "simplify", "taylor", "convert", "stats",
] as const;

export const calculate = tool({
  description: `Perform exact mathematical calculations using the Scientia Labs Computation Engine.
Use this tool for ANY mathematical operation instead of trying to compute the result yourself.
This ensures 100% accuracy for calculations.

Supported types: evaluate, derivative, integral, limit, solve, system, determinant, inverse, eigenvalues, simplify, taylor, convert, stats.`,

  parameters: z.object({
    type: z.string().describe("The type of mathematical operation: evaluate, derivative, integral, limit, solve, system, determinant, inverse, eigenvalues, simplify, taylor, convert, stats"),
    expression: z.string().describe("The mathematical expression to compute"),
    variable: z.string().optional().describe("The variable (default: x)"),
  }),

  execute: async ({ type, expression, variable }) => {
    if (!validTypes.includes(type as typeof validTypes[number])) {
      return {
        error: `Invalid type: "${type}". Must be one of: ${validTypes.join(", ")}`,
        expression,
        type,
      };
    }

    const result = await computationEngine.execute({
      type: type as ComputationType,
      expression,
      variable,
    });

    if (!result.success) {
      return {
        error: result.error || "Computation failed",
        expression,
        type,
      };
    }

    return {
      expression: result.expression,
      type: result.type,
      result: result.result,
      resultLatex: result.resultLatex,
      steps: result.steps.map((step) => ({
        step: step.step,
        description: step.description,
        input: step.inputLatex,
        output: step.outputLatex,
        rule: step.rule,
      })),
      stepCount: result.metadata.stepCount,
      confidence: result.metadata.confidence,
    };
  },
});