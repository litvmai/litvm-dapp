export const RANKS = [
  { name: "Spark", min: 0 },
  { name: "Scout", min: 50 },
  { name: "Trader", min: 150 },
  { name: "Builder", min: 400 },
  { name: "Ranger", min: 1000 },
  { name: "Legend", min: 2500 },
] as const;

export type Rank = (typeof RANKS)[number];

export function rankFor(xp: number) {
  let current: Rank = RANKS[0];
  let next: Rank | null = RANKS[1] ?? null;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].min) {
      current = RANKS[i];
      next = RANKS[i + 1] ?? null;
    }
  }
  const span = next ? next.min - current.min : 1;
  const progress = next ? Math.min(1, (xp - current.min) / span) : 1;
  return { current, next, progress };
}
