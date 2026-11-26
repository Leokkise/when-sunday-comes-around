import { memo } from 'react'
import { ballRadius, courtSize, netLength, netRadius, rim, type ShotFrame } from './shot'
import { ui } from '../ui-classes'

export const BasketballNet = memo(function BasketballNet({ frame, front }: { frame: ShotFrame | null; front: boolean }) {
  const strands = 12
  const rows = 6
  const center = (rim.left + rim.right) / 2
  const stretch = frame?.netStretch ?? 0
  const sway = frame?.netSway ?? 0
  const knots = Array.from({ length: rows }, (_, row) => {
    const fraction = row / (rows - 1)
    const rowY = rim.y + fraction * netLength * (1 + stretch)
    const rowCenter = center + sway * fraction * fraction
    const ballDistance = frame?.touchingNet ? Math.abs(frame.y - rowY) : ballRadius
    const contactRadius = Math.sqrt(Math.max(0, ballRadius ** 2 - ballDistance ** 2))
    const radius = frame?.inNet ? Math.max(netRadius(fraction), contactRadius * 1.05) : netRadius(fraction)
    const contactLimit = frame?.inNet ? 40 : 14
    const contactShift = frame?.touchingNet
      ? Math.max(-contactLimit, Math.min(contactLimit, frame.x - rowCenter)) * contactRadius / ballRadius
      : 0
    return Array.from({ length: strands }, (_, strand) => {
      const angle = (strand + (row % 2) * .5) / strands * Math.PI * 2
      return {
        x: rowCenter + Math.cos(angle) * radius + contactShift * Math.min(1, fraction * 2),
        y: rowY + Math.sin(angle) * rim.depth / 2 * (1 - fraction * .4) + Math.cos(angle) * sway * fraction * .22,
        front: Math.sin(angle) >= 0,
      }
    })
  })
  const paths = knots.slice(0, -1).flatMap((ring, row) => ring.flatMap((knot, strand) => {
    if (knot.front !== front) return []
    const next = knots[row + 1]
    const neighbor = (strand + (row % 2 ? 1 : strands - 1)) % strands
    return [strand, neighbor].map(index => {
      const end = next[index]
      return `M${knot.x} ${knot.y}Q${(knot.x + end.x) / 2 + .8} ${(knot.y + end.y) / 2 + .6} ${end.x} ${end.y}`
    })
  })).join(' ')

  return <svg className={ui(front ? 'hoops-net hoops-net-front' : 'hoops-net hoops-net-back')}
    viewBox={`0 0 ${courtSize.width} ${courtSize.height}`} aria-hidden="true" data-net-front={front}
    data-stretch={stretch} data-sway={sway} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={paths} stroke={front ? '#76634f' : '#92826c'} strokeWidth={front ? 5 : 3.4} />
    <path d={paths} stroke={front ? '#fff1d6' : '#dfd3b9'} strokeWidth={front ? 2.6 : 1.6} />
    {knots.slice(1).flatMap((ring, row) => ring.filter(knot => knot.front === front).map((knot, index) =>
      <circle key={`${row}-${index}`} cx={knot.x} cy={knot.y} r="1.5" fill="#e9dfc3" stroke="#92846a" strokeWidth=".6" />))}
  </svg>
})
