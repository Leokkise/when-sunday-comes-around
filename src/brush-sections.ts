export const toothCenters = {
  upper: [7, 13, 19, 25, 31, 37, 45, 55, 63, 69, 75, 81, 87, 93],
  lower: [8, 15, 22, 28, 34, 40, 47, 53, 60, 66, 72, 78, 85, 92],
}
export const teethPerRow = toothCenters.upper.length

function toothEdges(centers: number[]) {
  return [0, ...centers.slice(1).map((center, index) => (centers[index] + center) / 2), 100]
}

export const toothBounds = {
  upper: toothEdges(toothCenters.upper),
  lower: toothEdges(toothCenters.lower),
}

export const toothSectionBounds = {
  upper: [0, toothBounds.upper[5], toothBounds.upper[9], 100],
  lower: [0, toothBounds.lower[5], toothBounds.lower[9], 100],
}

export function toothAt(x: number, upper: boolean) {
  return (upper ? toothBounds.upper : toothBounds.lower).findIndex((edge, index) => index > 0 && x < edge) - 1
}

export function sectionForTooth(index: number) {
  return index < 5 ? 0 : index < 9 ? 1 : 2
}

export function restoreToothProgress(amounts: number[]) {
  if (amounts.length === teethPerRow) return amounts
  const sections = amounts.length === 6 ? [
    (amounts[0] + amounts[1]) / 2,
    (amounts[2] + amounts[3]) / 2,
    (amounts[4] + amounts[5]) / 2,
  ] : amounts.length === 4 ? [amounts[0], (amounts[1] + amounts[2]) / 2, amounts[3]] : amounts
  return Array.from({ length: teethPerRow }, (_, index) => sections[sectionForTooth(index)] ?? 0)
}
