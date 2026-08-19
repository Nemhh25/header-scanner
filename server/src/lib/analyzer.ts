import { checks } from "./headerRules.js";

export interface CheckResult {
  header: string;
  passed: boolean;
  description: string;
  recommendation: string;
  actualValue: string | null;
}

function scoreToGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function analyzeHeaders(headers: Record<string, string>) {
  const results: CheckResult[] = checks.map((check) => {
    const actualValue = headers[check.header] ?? null;
    const passed = check.validate(actualValue ?? undefined);

    return {
      header: check.header,
      passed,
      description: check.description,
      recommendation: check.recommendation,
      actualValue,
    };
  });

  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const earnedWeight = results
    .filter((result) => result.passed)
    .reduce((sum, result) => {
      const check = checks.find((c) => c.header === result.header)!;
      return sum + check.weight;
    }, 0);

  const score = Math.round((earnedWeight / totalWeight) * 100);
  const grade = scoreToGrade(score);

  return { grade, score, results };
}