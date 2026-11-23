export function advanceHairSweep(start: number | null, x: number, width: number, direction: 'left' | 'right') {
  const anchor = start === null ? x : direction === 'right' ? Math.min(start, x) : Math.max(start, x)
  const distance = direction === 'right' ? x - anchor : anchor - x
  return { anchor, complete: distance >= width * .2 }
}
