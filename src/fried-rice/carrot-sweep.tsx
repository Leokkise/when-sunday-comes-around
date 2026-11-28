import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { ui } from '../ui-classes'

const sweepStart = 0.14
const sweepEnd = 0.86
const edgeTolerance = 0.18
const pieces = [
  { clip: 'polygon(0 33%,20% 33%,20% 70%,0 70%)', travel: 46, turn: -16, lag: 155 },
  { clip: 'polygon(0 0,100% 0,100% 71%,81% 71%,81% 100%,0 100%,0 70%,20% 70%,20% 33%,0 33%)', travel: 58, turn: 10, lag: 125 },
  { clip: 'polygon(81% 71%,100% 71%,100% 100%,81% 100%)', travel: 30, turn: 17, lag: 205 },
]

export function CarrotSweep({ carrot, softenedCarrot, spatula, count, goal, onSweep }: {
  carrot: string
  softenedCarrot: string
  spatula: string
  count: number
  goal: number
  onSweep: (keyboard: boolean) => void
}) {
  const [position, setPosition] = useState<number | null>(null)
  const started = useRef(false)
  const lastPass = useRef(-1)
  const finishTimer = useRef<number | undefined>(undefined)
  const rightward = count % 2 === 0
  const start = rightward ? sweepStart : sweepEnd
  const end = rightward ? sweepEnd : sweepStart
  const direction = rightward ? 'right' : 'left'
  const stirOffset = (position ?? 0.5) - 0.5
  const doneness = (count + Number(finishTimer.current !== undefined)) / goal

  useEffect(() => () => window.clearTimeout(finishTimer.current), [])

  function finishSweep(keyboard: boolean) {
    if (lastPass.current === count) return
    lastPass.current = count
    setPosition(end)
    started.current = !keyboard
    if (count + 1 < goal || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onSweep(keyboard)
    } else {
      finishTimer.current = window.setTimeout(() => onSweep(keyboard), 180)
    }
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    if (finishTimer.current !== undefined || !event.isPrimary) return
    if (event.pointerType !== 'mouse' && !event.currentTarget.hasPointerCapture(event.pointerId)) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (event.clientY < bounds.top || event.clientY > bounds.bottom) {
      started.current = false
      return
    }
    const x = (event.clientX - bounds.left) / bounds.width
    setPosition(Math.max(sweepStart, Math.min(sweepEnd, x)))
    if (Math.abs(x - start) <= edgeTolerance) started.current = true
    if (started.current && Math.abs(x - end) <= edgeTolerance) finishSweep(false)
  }

  return <>
    <span className={ui('fried-rice-pan-carrot grid place-items-center')} role="img" aria-label="Carrot in the pan"
      style={{ '--fried-rice-carrot-doneness': doneness } as CSSProperties}>
      <span className="relative block aspect-[240/149] h-full max-w-full">
        {pieces.map(piece => <span key={piece.clip} className={ui('fried-rice-sweep-piece')} style={{
          clipPath: piece.clip,
          '--fried-rice-sweep-food-x': `${stirOffset * piece.travel}%`,
          '--fried-rice-sweep-turn': `${stirOffset * piece.turn}deg`,
          '--fried-rice-sweep-lag': `${piece.lag}ms`,
        } as CSSProperties}>
          <img src={carrot} alt="" className="absolute inset-0 size-full" />
          <img src={softenedCarrot} alt="" className={ui('fried-rice-sweep-texture')} />
        </span>)}
      </span>
    </span>
    <button type="button" className={ui('fried-rice-sweep-area')} data-next="true" aria-label="Sweep the spatula"
      aria-description={`Sweep ${direction}. Pass ${count + 1} of ${goal}.`} aria-keyshortcuts="ArrowLeft ArrowRight"
      style={{ '--fried-rice-sweep-x': `${(position ?? start) * 100}%`, '--fried-rice-sweep-tilt': `${stirOffset * 34}deg` } as CSSProperties}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        move(event)
      }}
      onPointerMove={move}
      onPointerUp={() => { started.current = false }}
      onPointerLeave={() => { started.current = false }}
      onLostPointerCapture={() => { started.current = false }}
      onKeyDown={event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
        event.preventDefault()
        if (!event.repeat && event.key === (rightward ? 'ArrowRight' : 'ArrowLeft')) finishSweep(true)
      }}
      onClick={event => { if (event.detail === 0) finishSweep(true) }}>
      <span className={ui('fried-rice-sweep-guide')} data-left={!rightward || undefined} aria-hidden="true" />
      <span className={ui('fried-rice-sweep-tool')} aria-hidden="true">
        <img src={spatula} className={ui('fried-rice-sweep-spatula')} alt="" />
      </span>
    </button>
  </>
}
