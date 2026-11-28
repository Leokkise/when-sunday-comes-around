import type { CSSProperties } from 'react'
import { ui } from '../ui-classes'

export const carrotCuts = [
  { axis: 'along', position: 52 },
  { axis: 'along', position: 27 },
  { axis: 'along', position: 76 },
  { axis: 'across', position: 88 },
  { axis: 'across', position: 76 },
  { axis: 'across', position: 64 },
  { axis: 'across', position: 52 },
  { axis: 'across', position: 40 },
  { axis: 'across', position: 28 },
  { axis: 'across', position: 16 },
] as const

const carrotFrames = Array.from({ length: carrotCuts.length + 1 }, (_, taps) => {
  const cuts = carrotCuts.slice(0, taps)
  const edges = (axis: 'along' | 'across') =>
    [0, ...cuts.filter(cut => cut.axis === axis).map(cut => cut.position).sort((a, b) => a - b), 100]
  const rows = edges('along')
  const columns = edges('across')

  return rows.slice(0, -1).flatMap((top, row) => columns.slice(0, -1).map((left, column) => ({
    clipPath: `inset(${top}% ${100 - columns[column + 1]}% ${100 - rows[row + 1]}% ${left}%)`,
    translate: `${(column - (columns.length - 2) / 2) * 0.9}% ${(row - (rows.length - 2) / 2) * 4}%`,
  })))
})

export function CarrotPieces({ taps }: { taps: number }) {
  return carrotFrames[taps]?.map((style, index) =>
    <span key={index} className={ui('fried-rice-chop-segment')} style={style as CSSProperties} />)
}
