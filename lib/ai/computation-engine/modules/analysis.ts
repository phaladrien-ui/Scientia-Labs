// lib/ai/computation-engine/modules/analysis.ts

/**
 * Scientia Labs — Computation Engine
 * Module Analyse : dérivées, intégrales, limites, séries de Taylor
 */

import { StepRecorder } from "../core/step-recorder";
import type { ParsedExpression } from "../core/parser";
import type { ComputationResult } from "../core/types";

export class AnalysisModule {
  private stepRecorder: StepRecorder;

  constructor(stepRecorder: StepRecorder) {
    this.stepRecorder = stepRecorder;
  }

  /**
   * Point d'entrée du module analyse
   */
  async execute(parsed: ParsedExpression): Promise<ComputationResult> {
    switch (parsed.type) {
      case "derivative":
        return this.computeDerivative(parsed);
      case "integral":
        return this.computeIntegral(parsed);
      case "limit":
        return this.computeLimit(parsed);
      case "taylor":
        return this.computeTaylor(parsed);
      default:
        throw new Error(`Analysis module does not support type: ${parsed.type}`);
    }
  }

  /**
   * Calcule la dérivée d'un polynôme
   * Supporte : ax^n + bx^m + ... + c
   */
  private computeDerivative(parsed: ParsedExpression): ComputationResult {
    const expr = parsed.expression;
    const variable = parsed.variable || "x";

    this.stepRecorder.add({
      description: `Parse polynomial for differentiation with respect to ${variable}`,
      inputLatex: expr,
      outputLatex: "Identifying terms...",
    });

    // Parser les termes du polynôme
    const terms = this.parsePolynomialTerms(expr);

    if (terms.length === 0) {
      throw new Error("Could not parse polynomial. Use format: ax^n + bx^m + ... + c");
    }

    const derivedTerms: string[] = [];
    const derivedTermsLatex: string[] = [];

    for (const term of terms) {
      const { coefficient, exponent } = term;

      if (exponent === 0) {
        // Constante → dérivée = 0
        this.stepRecorder.add({
          description: `Derivative of constant ${coefficient}`,
          inputLatex: `\\frac{d}{d${variable}} ${coefficient}`,
          outputLatex: "0",
          rule: "d/dx(c) = 0",
        });
        continue;
      }

      const newCoeff = coefficient * exponent;
      const newExp = exponent - 1;

      let derivedLatex = "";
      if (newExp === 0) {
        derivedLatex = `${newCoeff}`;
        derivedTerms.push(`${newCoeff}`);
        derivedTermsLatex.push(`${newCoeff}`);
      } else if (newExp === 1) {
        derivedLatex = `${newCoeff}${variable}`;
        derivedTerms.push(`${newCoeff}${variable}`);
        derivedTermsLatex.push(`${newCoeff}${variable}`);
      } else {
        derivedLatex = `${newCoeff}${variable}^{${newExp}}`;
        derivedTerms.push(`${newCoeff}${variable}^${newExp}`);
        derivedTermsLatex.push(`${newCoeff}${variable}^{${newExp}}`);
      }

      this.stepRecorder.add({
        description: `Derivative of ${coefficient}${variable}^${exponent}`,
        inputLatex: `\\frac{d}{d${variable}} ${coefficient}${variable}^{${exponent}}`,
        outputLatex: derivedLatex,
        rule: `d/dx(x^n) = n·x^(n-1)`,
      });
    }

    const result = derivedTerms.join(" + ").replace(/\+ -/g, "- ") || "0";
    const resultLatex = derivedTermsLatex.join(" + ").replace(/\+ -/g, "- ") || "0";

    return {
      success: true,
      expression: expr,
      type: "derivative",
      result,
      resultLatex,
      steps: this.stepRecorder.getAll(),
      metadata: {
        duration: 0,
        stepCount: this.stepRecorder.count,
        confidence: 1.0,
      },
    };
  }

  /**
   * Calcule l'intégrale indéfinie d'un polynôme
   */
  private computeIntegral(parsed: ParsedExpression): ComputationResult {
    const expr = parsed.expression;
    const variable = parsed.variable || "x";

    this.stepRecorder.add({
      description: `Parse polynomial for integration with respect to ${variable}`,
      inputLatex: expr,
      outputLatex: "Identifying terms...",
    });

    const terms = this.parsePolynomialTerms(expr);

    if (terms.length === 0) {
      throw new Error("Could not parse polynomial. Use format: ax^n + bx^m + ... + c");
    }

    const integratedTerms: string[] = [];
    const integratedTermsLatex: string[] = [];

    for (const term of terms) {
      const { coefficient, exponent } = term;
      const newExp = exponent + 1;
      const newCoeff = coefficient / newExp;

      let integratedLatex = "";
      if (newExp === 1) {
        integratedLatex = `${newCoeff}${variable}`;
        integratedTerms.push(`${newCoeff}${variable}`);
        integratedTermsLatex.push(`${newCoeff}${variable}`);
      } else {
        integratedLatex = `\\frac{${coefficient}}{${newExp}}${variable}^{${newExp}}`;
        integratedTerms.push(`(${coefficient}/${newExp})${variable}^${newExp}`);
        integratedTermsLatex.push(`\\frac{${coefficient}}{${newExp}}${variable}^{${newExp}}`);
      }

      this.stepRecorder.add({
        description: `Integrate ${coefficient}${variable}^${exponent}`,
        inputLatex: `\\int ${coefficient}${variable}^{${exponent}} d${variable}`,
        outputLatex: integratedLatex,
        rule: "∫x^n dx = x^(n+1)/(n+1)",
      });
    }

    const result = integratedTerms.join(" + ").replace(/\+ -/g, "- ") + " + C";
    const resultLatex = integratedTermsLatex.join(" + ").replace(/\+ -/g, "- ") + " + C";

    this.stepRecorder.add({
      description: "Add constant of integration",
      inputLatex: "C",
      outputLatex: "+ C",
      rule: "Indefinite integral constant",
    });

    return {
      success: true,
      expression: expr,
      type: "integral",
      result,
      resultLatex,
      steps: this.stepRecorder.getAll(),
      metadata: {
        duration: 0,
        stepCount: this.stepRecorder.count,
        confidence: 1.0,
      },
    };
  }

  /**
   * Calcule une limite simple
   * Supporte : lim x→a (polynôme)
   */
  private computeLimit(parsed: ParsedExpression): ComputationResult {
    const expr = parsed.expression;

    // Format attendu : "f(x) as x→a" ou "f(x) when x=a"
    const limitMatch = expr.match(/^(.+?)\s+(?:as|when)\s+(\w+)\s*→\s*(-?[\d.]+)$/i);

    if (!limitMatch) {
      throw new Error('Format expected: "expression as x→value" (e.g., "x^2 + 2x as x→3")');
    }

    const [, funcExpr, variable, targetStr] = limitMatch;
    const target = parseFloat(targetStr);

    // Substitution directe pour les polynômes
    const substituted = funcExpr
      .replace(new RegExp(`${variable}\\^(\\d+)`, "g"), `Math.pow(${target}, $1)`)
      .replace(new RegExp(`${variable}`, "g"), `(${target})`);

    this.stepRecorder.add({
      description: `Substitute ${variable} = ${target}`,
      inputLatex: funcExpr,
      outputLatex: `Evaluating at ${variable} = ${target}`,
    });

    this.stepRecorder.add({
      description: "Direct substitution (function is continuous)",
      inputLatex: substituted,
      outputLatex: "Computing...",
      rule: "lim x→a f(x) = f(a) for continuous functions",
    });

    const result = this.safeEval(substituted);

    return {
      success: true,
      expression: expr,
      type: "limit",
      result: String(result),
      resultLatex: `\\lim_{${variable} \\to ${target}} ${funcExpr} = ${result}`,
      steps: this.stepRecorder.getAll(),
      metadata: {
        duration: 0,
        stepCount: this.stepRecorder.count,
        confidence: 1.0,
      },
    };
  }

  /**
   * Calcule une série de Taylor à l'ordre n autour d'un point
   */
  private computeTaylor(parsed: ParsedExpression): ComputationResult {
    const expr = parsed.expression;
    const order = (parsed.params?.order as number) || 4;
    const point = (parsed.params?.point as number) || 0;

    this.stepRecorder.add({
      description: `Compute Taylor series of order ${order} around x = ${point}`,
      inputLatex: expr,
      outputLatex: "Computing derivatives...",
    });

    // Pour l'instant, support basique pour sin(x), cos(x), e^x
    const taylorSeries: Record<string, string[]> = {
      sin: ["x", "x - x^3/6", "x - x^3/6 + x^5/120", "x - x^3/6 + x^5/120 - x^7/5040"],
      cos: ["1", "1 - x^2/2", "1 - x^2/2 + x^4/24", "1 - x^2/2 + x^4/24 - x^6/720"],
      exp: ["1 + x", "1 + x + x^2/2", "1 + x + x^2/2 + x^3/6", "1 + x + x^2/2 + x^3/6 + x^4/24"],
    };

    const funcName = expr.match(/^(\w+)/)?.[1]?.toLowerCase() || "";

    if (taylorSeries[funcName] && order >= 1 && order <= 4) {
      const series = taylorSeries[funcName][order - 1];

      this.stepRecorder.add({
        description: `Apply known Taylor series for ${funcName}(x)`,
        inputLatex: `${funcName}(x)`,
        outputLatex: series,
        rule: `Standard Taylor expansion of ${funcName}(x)`,
      });

      return {
        success: true,
        expression: expr,
        type: "taylor",
        result: series,
        resultLatex: `${funcName}(x) \\approx ${series}`,
        steps: this.stepRecorder.getAll(),
        metadata: {
          duration: 0,
          stepCount: this.stepRecorder.count,
          confidence: 1.0,
        },
      };
    }

    throw new Error(
      `Taylor series currently supports sin(x), cos(x), e^x up to order 4. Requested: ${expr}`
    );
  }

  /**
   * Parse les termes d'un polynôme
   * Retourne [{coefficient, exponent}, ...]
   */
  private parsePolynomialTerms(expr: string): Array<{ coefficient: number; exponent: number }> {
    const terms: Array<{ coefficient: number; exponent: number }> = [];

    // Normaliser l'expression
    const normalized = expr
      .replace(/\s/g, "")
      .replace(/-/g, "+-")
      .replace(/\+{2,}/g, "+")
      .replace(/^\++/, "");

    const termStrings = normalized.split("+").filter((t) => t.length > 0);

    for (const term of termStrings) {
      // Cas : constante seule (ex: 5 ou -3)
      if (/^-?\d+\.?\d*$/.test(term)) {
        terms.push({ coefficient: parseFloat(term), exponent: 0 });
        continue;
      }

      // Cas : ax ou x (exposant 1)
      if (/^-?\d*\.?\d*[a-zA-Z]$/.test(term) && !term.includes("^")) {
        const coeffMatch = term.match(/^(-?\d*\.?\d*)/);
        const coeff = coeffMatch && coeffMatch[1] !== "" && coeffMatch[1] !== "-"
          ? parseFloat(coeffMatch[1])
          : term.startsWith("-") ? -1 : 1;
        terms.push({ coefficient: coeff, exponent: 1 });
        continue;
      }

      // Cas : ax^n
      const match = term.match(/^(-?\d*\.?\d*)\*?[a-zA-Z]\^(-?\d+)$/);
      if (match) {
        const coeff = match[1] === "" || match[1] === "-" 
          ? (match[1] === "-" ? -1 : 1) 
          : parseFloat(match[1]);
        const exp = parseInt(match[2]);
        terms.push({ coefficient: coeff, exponent: exp });
        continue;
      }

      // Cas : x^n
      const simpleMatch = term.match(/^(-?)[a-zA-Z]\^(-?\d+)$/);
      if (simpleMatch) {
        const coeff = simpleMatch[1] === "-" ? -1 : 1;
        const exp = parseInt(term.match(/\^(-?\d+)$/)![1]);
        terms.push({ coefficient: coeff, exponent: exp });
        continue;
      }
    }

    return terms;
  }

  /**
   * Évalue une expression mathématique simple de manière sécurisée
   */
  private safeEval(expr: string): number {
    // Remplacer les fonctions mathématiques
    const sanitized = expr
      .replace(/Math\.pow\(/g, "Math.pow(")
      .replace(/\^/g, "**");

    // Vérification finale de sécurité
    if (/[^0-9+\-*/().%\sMath.pow]/.test(sanitized.replace(/Math\.pow/g, ""))) {
      throw new Error("Expression contains unauthorized functions");
    }

    return Function(`"use strict"; return (${sanitized})`)();
  }
}