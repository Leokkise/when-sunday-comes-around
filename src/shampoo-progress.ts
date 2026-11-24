export const shampooAreas = ['left', 'middle', 'right'] as const
export const shampooRubsPerArea = 10
export const shampooMoves = shampooAreas.length * shampooRubsPerArea
export type ShampooArea = 0 | 1 | 2
export type ShampooProgress = [number, number, number]

export function restoreShampooProgress(value: unknown): ShampooProgress {
  const areas = Array.isArray(value) ? value : []
  return [0, 1, 2].map(index => Number.isInteger(areas[index])
    ? Math.max(0, Math.min(shampooRubsPerArea, areas[index])) : 0) as ShampooProgress
}

export function shampooAreaAt(x: number): ShampooArea | null {
  return Number.isFinite(x) && x >= 0 && x <= 1 ? Math.min(2, Math.floor(x * 3)) as ShampooArea : null
}

export function addShampooRub(progress: ShampooProgress, area: ShampooArea): ShampooProgress {
  if (progress[area] >= shampooRubsPerArea) return progress
  const next: ShampooProgress = [...progress]
  next[area]++
  return next
}
