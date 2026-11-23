import { ui } from './ui-classes'
import { useState, type SVGProps } from 'react'

const shinePaths = ['M37 6Q37 10 38 15M33.5 10L42 11', 'M20 31L20.5 39M16 35L24 34.5', 'M78.5 25.5L79 31.5M76 28.5H82']
const shineAnchors = [[37.5, 10.5], [20, 35], [79, 28.5]]

export function ShineGlint({ variant = 0, ...props }: SVGProps<SVGSVGElement> & { variant?: number }) {
  const [x, y] = shineAnchors[variant]
  return <svg className={ui("character-glint")} {...props} viewBox={`${x - 7.5} ${y - 7.5} 15 15`} overflow="visible" aria-hidden="true">
    <path d={shinePaths[variant]} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}

type ShineSpot = { x: number; y: number; spread?: [number, number] }

export function StaggeredGlints({ spots, className, leadIn = false }: { spots: ShineSpot[]; className: string; leadIn?: boolean }) {
  return shinePaths.slice(0, spots.length).map((path, slot) =>
    <PositionedGlint key={path} className={className} spots={spots.filter((_, index) => index % shinePaths.length === slot)}
      variant={slot} delay={slot * (leadIn ? -.5 : .5)} />
  )
}

const hairShineSpots: ShineSpot[] = [
  { x: 57, y: 11, spread: [7, 4] },
  { x: 41, y: 12, spread: [8, 5] },
  { x: 47, y: 7, spread: [11, 3] },
  { x: 36, y: 14, spread: [4, 5] },
  { x: 49, y: 11, spread: [6, 4] },
  { x: 61, y: 14, spread: [3, 5] },
  { x: 39, y: 9.5, spread: [6, 3] },
  { x: 53, y: 8, spread: [5, 4] },
  { x: 39, y: 15.5, spread: [5, 2.5] },
  { x: 50.5, y: 13.5, spread: [2.5, 2.5] },
  { x: 46, y: 12.5, spread: [5, 2.5] },
  { x: 58, y: 14, spread: [2, 2] },
]

export function HairShine() {
  return <CharacterShine hair spots={hairShineSpots} />
}

function CharacterShine({ spots, hair = false }: { spots: ShineSpot[]; hair?: boolean }) {
  if (!spots.length) return null

  return <span className={ui("wash-character-shine")} data-hair={hair} aria-hidden="true">
    <StaggeredGlints className="wash-character-glint" spots={spots} leadIn={hair} />
  </span>
}

function PositionedGlint({ spots, variant, delay, className }: {
  spots: ShineSpot[]; variant: number; delay: number; className: string
}) {
  const [position, setPosition] = useState(() => ({
    index: Math.floor(Math.random() * spots.length), x: Math.random() - .5, y: Math.random() - .5,
  }))
  const spot = spots[position.index % spots.length]
  const [spreadX, spreadY] = spot.spread ?? [0, 0]

  return <ShineGlint className={ui('character-glint ' + className)} variant={variant}
    data-extra-glint={Boolean(delay)}
    style={{
      left: spot.x + position.x * spreadX + '%',
      top: spot.y + position.y * spreadY + '%',
      animationDelay: delay + 's',
    }}
    onAnimationIteration={() => {
      const step = 1 + Math.floor(Math.random() * (spots.length - 1))
      const offset = { x: Math.random() - .5, y: Math.random() - .5 }
      setPosition(current => ({ index: (current.index + step) % spots.length, ...offset }))
    }} />
}

const bodyShineSpots: (ShineSpot & { name: string })[] = [
  { name: 'right arm', x: 60, y: 37, spread: [1, 3] },
  { name: 'body', x: 51, y: 41, spread: [9, 8] },
  { name: 'left arm', x: 36, y: 47, spread: [1, 3] },
  { name: 'right knee', x: 57, y: 75, spread: [2, 9] },
  { name: 'left knee', x: 44, y: 77, spread: [1.5, 8] },
  { name: 'right foot', x: 57, y: 95.5, spread: [1.5, .6] },
  { name: 'left foot', x: 41.5, y: 95.5, spread: [1.5, .6] },
  { name: 'body', x: 49, y: 28, spread: [4, 3] },
  { name: 'body', x: 49, y: 34, spread: [12, 5] },
  { name: 'left arm', x: 38, y: 36, spread: [1, 4] },
  { name: 'right arm', x: 62.8, y: 46, spread: [1, 5] },
  { name: 'left arm', x: 34.6, y: 55, spread: [1, 5] },
  { name: 'right arm', x: 64.1, y: 55, spread: [1, 5] },
  { name: 'left knee', x: 43, y: 68.5, spread: [3, 3] },
  { name: 'right knee', x: 55.5, y: 68.5, spread: [3, 3] },
  { name: 'left foot', x: 43, y: 88, spread: [1.5, 5] },
  { name: 'right foot', x: 55.5, y: 88, spread: [1.5, 5] },
]

export function BodyShine({ rinsed }: { rinsed?: string[] }) {
  return <CharacterShine spots={rinsed ? bodyShineSpots.filter(spot => rinsed.includes(spot.name)) : bodyShineSpots} />
}
