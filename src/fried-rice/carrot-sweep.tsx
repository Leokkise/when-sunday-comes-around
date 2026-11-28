import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type RefObject } from 'react'
import { ui } from '../ui-classes'
import { DicedCarrot } from './diced-carrot'

const sweepStart = 0.14
const sweepEnd = 0.86
const edgeTolerance = 0.18
export function CarrotSweep({ spatula, restingSpatula, count, goal, onSweep }: {
  spatula: string
  restingSpatula: RefObject<HTMLImageElement | null>
  count: number
  goal: number
  onSweep: (keyboard: boolean) => void
}) {
  const [position, setPosition] = useState<number | null>(null)
  const [settling, setSettling] = useState(false)
  const started = useRef(false)
  const lastPass = useRef(-1)
  const finishTimer = useRef<number | undefined>(undefined)
  const tool = useRef<HTMLSpanElement>(null)
  const sweptSpatula = useRef<HTMLImageElement>(null)
  const parkAnimation = useRef<Animation | null>(null)
  const rightward = count % 2 === 0
  const start = rightward ? sweepStart : sweepEnd
  const end = rightward ? sweepEnd : sweepStart
  const direction = rightward ? 'right' : 'left'
  const stirOffset = (position ?? 0.5) - 0.5
  useEffect(() => () => {
    window.clearTimeout(finishTimer.current)
    parkAnimation.current?.cancel()
  }, [])

  function putSpatulaDown(keyboard: boolean) {
    const from = sweptSpatula.current?.getBoundingClientRect()
    const to = restingSpatula.current?.getBoundingClientRect()
    if (!from || !to || !tool.current) return onSweep(keyboard)

    const x = to.left - from.left
    const y = to.top - from.top
    const lift = Math.min(30, from.height / 4)
    parkAnimation.current = tool.current.animate([
      { transform: 'translate(0, 0)' },
      { transform: `translate(${x / 2}px, ${y / 2 - lift}px)` },
      { transform: `translate(${x}px, ${y}px)` },
    ], { duration: 360, easing: 'ease-in-out', fill: 'forwards' })
    parkAnimation.current.onfinish = () => onSweep(keyboard)
  }

  function finishSweep(keyboard: boolean) {
    if (lastPass.current === count) return
    lastPass.current = count
    setPosition(end)
    started.current = !keyboard
    if (count + 1 < goal || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onSweep(keyboard)
    } else {
      setSettling(true)
      finishTimer.current = window.setTimeout(() => putSpatulaDown(keyboard), 220)
    }
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    if (finishTimer.current !== undefined || !event.isPrimary) return
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
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
    <DicedCarrot className="fried-rice-pan-carrot" label="Carrot in the pan" stirring
      doneness={settling ? 1 : count / goal} stirOffset={settling ? 0 : stirOffset} />
    <button type="button" className={ui('fried-rice-sweep-area')} data-next="true" aria-label="Sweep the spatula"
      aria-description={settling ? 'Carrot softened.' : `Sweep ${direction}. Pass ${count + 1} of ${goal}.`}
      aria-disabled={settling || undefined} aria-keyshortcuts="ArrowLeft ArrowRight"
      style={{ '--fried-rice-sweep-x': `${(position ?? start) * 100}%`, '--fried-rice-sweep-tilt': `${settling ? 0 : stirOffset * 34}deg` } as CSSProperties}
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
      <span className={ui('fried-rice-sweep-guide')} data-left={!rightward || undefined} data-settling={settling || undefined} aria-hidden="true" />
      <span ref={tool} className={ui('fried-rice-sweep-tool')} aria-hidden="true">
        <img ref={sweptSpatula} src={spatula} className={ui('fried-rice-sweep-spatula')} alt="" />
      </span>
    </button>
  </>
}
