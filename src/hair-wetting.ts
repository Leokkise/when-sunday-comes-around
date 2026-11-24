export function advanceHairSweep(start: number | null, x: number, width: number, direction: 'left' | 'right') {
  const anchor = start === null ? x : direction === 'right' ? Math.min(start, x) : Math.max(start, x)
  const distance = direction === 'right' ? x - anchor : anchor - x
  return { anchor, complete: distance >= width * .2 }
}

export function advanceHairRinse(progress: number, x: number, reach: number) {
  if (x + reach <= progress || x - reach > progress + .04) return progress
  const next = Math.min(1, x + reach)
  return next >= .97 ? 1 : next
}
