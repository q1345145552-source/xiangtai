import { SolutionPlan } from "@prisma/client";

export function normalizeTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

export function scorePlan(plan: SolutionPlan, industry: string, tags: string[]) {
  let score = 0;
  if (plan.industry.toLowerCase() === industry.toLowerCase()) {
    score += 5;
  }
  const planTags = normalizeTags(plan.tags);
  for (const tag of tags) {
    if (planTags.includes(tag.toLowerCase())) {
      score += 2;
    }
  }
  return score;
}

export function buildEvaluationCode() {
  const now = new Date();
  const pad = (v: number) => String(v).padStart(2, "0");
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(
    now.getHours()
  )}${pad(now.getMinutes())}`;
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `XT-${timestamp}-${random}`;
}

export function buildAccessCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = () => chars[Math.floor(Math.random() * chars.length)];
  const chunk = Array.from({ length: 4 }, pick).join("");
  const chunk2 = Array.from({ length: 4 }, pick).join("");
  return `EVA-${chunk}-${chunk2}`;
}
