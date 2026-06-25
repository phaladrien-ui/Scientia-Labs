// lib/ai/computation-engine/modules/algebra.ts

/**
 * Scientia Labs — Computation Engine
 * Module Algèbre : résolution d'équations, systèmes linéaires, polynômes
 */

import { StepRecorder } from "../core/step-recorder";
import type { ParsedExpression } from "../core/parser";
import type { ComputationResult } from "../core/types";

export class AlgebraModule {
  private stepRecorder: StepRecorder;

  constructor(stepRecorder: StepRecorder) {
    this.stepRecorder = stepRecorder;
  }

  /**
   * Point d'entrée du module algèbre
   */
  async execute(parsed: ParsedExpression): Promise<ComputationResult> {
    switch (parsed.type) {
      case "solve":
        return this.solveEquation(parsed);
      case "system":
        return this.solveSystem(parsed);
      case "evaluate":
        return this.evaluateExpression(parsed);
      case "simplify":
        return this.simplifyExpression(parsed);
      default:
        throw new Error(`Algebra module does not support type: ${parsed.type}`);
    }
  }

  /**
   * Résout une équation polynomiale simple
   * Supporte : ax² + bx + c = 0, ax + b = 0
   */
  private solveEquation(parsed: ParsedExpression): ComputationResult {
    const expr = parsed.expression;
    this.stepRecorder.add({
      description: "Parse equation",
      inputLatex: expr,
      outputLatex: `Analyzing: ${expr}`,
    });

    // Détecter équation quadratique : ax² + bx + c = 0
    const quadraticMatch = expr.match(
      /([+-]?\d*\.?\d*)\s*\*?\s*x\s*\^\s*2\s*([+-]\s*\d*\.?\d*)\s*\*?\s*x\s*([+-]\s*\d*\.?\d*)\s*=\s*0/
    );

    if (quadraticMatch) {
      return this.solveQuadratic(quadraticMatch);
    }

    // Détecter équation linéaire : ax + b = 0
    const linearMatch = expr.match(
      /([+-]?\d*\.?\d*)\s*\*?\s*x\s*([+-]\s*\d*\.?\d*)\s*=\s*0/
    );

    if (linearMatch) {
      return this.solveLinear(linearMatch);
    }

    throw new Error("Could not parse equation. Supported formats: ax² + bx + c = 0 or ax + b = 0");
  }

  /**
   * Résout ax² + bx + c = 0
   */
  private solveQuadratic(match: RegExpMatchArray): ComputationResult {
    const a = parseFloat(match[1]) || 1;
    const b = parseFloat(match[2].replace(/\s/g, "")) || 0;
    const c = parseFloat(match[3].replace(/\s/g, "")) || 0;

    this.stepRecorder.add({
      description: "Identify coefficients",
      inputLatex: `${a}x^2 + ${b}x + ${c} = 0`,
      outputLatex: `a = ${a}, b = ${b}, c = ${c}`,
    });

    const discriminant = b * b - 4 * a * c;

    this.stepRecorder.add({
      description: "Calculate discriminant Δ = b² - 4ac",
      inputLatex: `Δ = ${b}^2 - 4(${a})(${c})`,
      outputLatex: `Δ = ${discriminant}`,
      rule: "Quadratic formula discriminant",
    });

    if (discriminant > 0) {
      const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);

      this.stepRecorder.add({
        description: "Apply quadratic formula: x = (-b ± √Δ) / 2a",
        inputLatex: `x = \\frac{-${b} \\pm \\sqrt{${discriminant}}}{2(${a})}`,
        outputLatex: `x_1 = ${x1}, x_2 = ${x2}`,
        rule: "Quadratic formula",
      });

      return {
        success: true,
        expression: `${a}x² + ${b}x + ${c} = 0`,
        type: "solve",
        result: `x₁ = ${x1}, x₂ = ${x2}`,
        resultLatex: `x_1 = ${x1},\\quad x_2 = ${x2}`,
        steps: this.stepRecorder.getAll(),
        metadata: {
          duration: 0,
          stepCount: this.stepRecorder.count,
          confidence: 1.0,
        },
      };
    }

    if (discriminant === 0) {
      const x = -b / (2 * a);

      this.stepRecorder.add({
        description: "Double root: x = -b / 2a",
        inputLatex: `x = \\frac{-${b}}{2(${a})}`,
        outputLatex: `x = ${x}`,
        rule: "Double root (Δ = 0)",
      });

      return {
        success: true,
        expression: `${a}x² + ${b}x + ${c} = 0`,
        type: "solve",
        result: `x = ${x} (double)`,
        resultLatex: `x = ${x}\\text{ (double root)}`,
        steps: this.stepRecorder.getAll(),
        metadata: {
          duration: 0,
          stepCount: this.stepRecorder.count,
          confidence: 1.0,
        },
      };
    }

    // Discriminant négatif : racines complexes
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-discriminant) / (2 * a);

    this.stepRecorder.add({
      description: "Complex roots (Δ < 0)",
      inputLatex: `Δ = ${discriminant} < 0`,
      outputLatex: `x = ${realPart} ± ${imagPart}i`,
      rule: "Complex conjugate roots",
    });

    return {
      success: true,
      expression: `${a}x² + ${b}x + ${c} = 0`,
      type: "solve",
      result: `x₁ = ${realPart} + ${imagPart}i, x₂ = ${realPart} - ${imagPart}i`,
      resultLatex: `x_1 = ${realPart} + ${imagPart}i,\\quad x_2 = ${realPart} - ${imagPart}i`,
      steps: this.stepRecorder.getAll(),
      metadata: {
        duration: 0,
        stepCount: this.stepRecorder.count,
        confidence: 1.0,
      },
    };
  }

  /**
   * Résout ax + b = 0
   */
  private solveLinear(match: RegExpMatchArray): ComputationResult {
    const a = parseFloat(match[1]) || 1;
    const b = parseFloat(match[2].replace(/\s/g, "")) || 0;

    this.stepRecorder.add({
      description: "Identify coefficients",
      inputLatex: `${a}x + ${b} = 0`,
      outputLatex: `a = ${a}, b = ${b}`,
    });

    this.stepRecorder.add({
      description: "Isolate x: x = -b / a",
      inputLatex: `x = \\frac{-${b}}{${a}}`,
      outputLatex: `x = ${-b / a}`,
      rule: "Linear equation solution",
    });

    return {
      success: true,
      expression: `${a}x + ${b} = 0`,
      type: "solve",
      result: `x = ${-b / a}`,
      resultLatex: `x = ${-b / a}`,
      steps: this.stepRecorder.getAll(),
      metadata: {
        duration: 0,
        stepCount: this.stepRecorder.count,
        confidence: 1.0,
      },
    };
  }

  /**
   * Résout un système de 2 équations linéaires
   */
  private solveSystem(parsed: ParsedExpression): ComputationResult {
    this.stepRecorder.add({
      description: "Parse system of equations",
      inputLatex: parsed.expression,
      outputLatex: "Analyzing system...",
    });

    throw new Error("System solver not yet implemented");
  }

  /**
   * Évalue une expression numérique simple
   */
  private evaluateExpression(parsed: ParsedExpression): ComputationResult {
    this.stepRecorder.add({
      description: "Evaluate expression",
      inputLatex: parsed.expression,
      outputLatex: "Computing...",
    });

    throw new Error("Numerical evaluator not yet implemented");
  }

  /**
   * Simplifie une expression symbolique
   */
  private simplifyExpression(parsed: ParsedExpression): ComputationResult {
    this.stepRecorder.add({
      description: "Simplify expression",
      inputLatex: parsed.expression,
      outputLatex: "Simplifying...",
    });

    throw new Error("Symbolic simplifier not yet implemented");
  }
}