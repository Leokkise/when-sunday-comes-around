import { ui } from './ui-classes'
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { InkFilters } from './ink-filters'
import { ActivityLoading } from './activity-loading'
import { bathSprite, brushFinishMouth, CleanBathScene } from './bath-scene'
import { ToothCoating, ToothpasteFoam, ToothRowShine, frontArt } from './tooth-coating'
import { TongueMouth } from './tongue-mouth'

type Point = { x: number; y: number }
type Tool = 'brush' | 'paste' | 'water'
const toolArt: Record<Tool, string> = { brush: '/brush-toothbrush-v2.webp', paste: '/brush-toothpaste-v2.webp', water: '/brush-water.webp' }
type BrushSpot = Point & { label: string; radius?: number; radiusY?: number }
type Round = { title: string; hint: string; view: 'mouth' | 'tongue'; spots: BrushSpot[] }
const backTeeth = 'Back teeth'
const frontTeeth = 'Front teeth'
const outsideHint = 'Follow the circle. Brush the outside of your teeth with little back-and-forth moves.'
const stepOrder = [0, 1, 2, 7, 8]
const rounds: Record<number, Round | undefined> = {
  1: { title: 'Brush your top teeth', hint: outsideHint, view: 'mouth', spots: [
    { x: 9, y: 43, radius: .08, label: backTeeth },
    { x: 22, y: 43, radius: .08, label: 'Side teeth' },
    { x: 39, y: 41, radius: .112, label: frontTeeth },
    { x: 61, y: 41, radius: .112, label: frontTeeth },
    { x: 78, y: 43, radius: .08, label: 'Side teeth' },
    { x: 91, y: 43, radius: .08, label: backTeeth },
  ] },
  2: { title: 'Brush your bottom teeth', hint: outsideHint, view: 'mouth', spots: [
    { x: 11, y: 61, radius: .09, label: backTeeth },
    { x: 25, y: 65, radius: .078, label: 'Side teeth' },
    { x: 40.5, y: 66, radius: .1, label: frontTeeth },
    { x: 59.5, y: 66, radius: .1, label: frontTeeth },
    { x: 75, y: 65, radius: .078, label: 'Side teeth' },
    { x: 89, y: 61, radius: .09, label: backTeeth },
  ] },
  7: { title: 'Brush your tongue', hint: 'Sweep gently from the back of your tongue to the tip.', view: 'tongue', spots: [
    { x: 53, y: 61.5, radius: .20, radiusY: .115, label: 'Tongue' },
  ] },
}
const organizerArt = '/brush-organizer-caddy.webp'
const images = ['/bathroom.webp', bathSprite, brushFinishMouth, '/bath-fixtures.webp', '/bath-supplies.webp', '/brush-smile.webp', frontArt, '/brush-sink-sage.webp', '/brush-front.webp', '/brush-contact.webp', '/brush-paste-dab.svg', organizerArt, ...Object.values(toolArt)]
const saveKey = 'when-sunday.brush-teeth.v2'
// Saved spots use the same progress scale even when a round has more spots.
const spotUnits = 5000
const spotRadius = .08
const toothRoundTime = 9000
const tongueRoundTime = 2500
const expandedSpotIndexes = [0, 0, 1, 2, 3, 3]
const pasteSqueezeTime = 1450
const spitTime = 2700
const introCoverTime = 1900
const introRevealTime = 700

function ToothpasteTransition({ revealing }: { revealing: boolean }) {
  return <div className={ui(`brush-paste-transition ${revealing ? 'is-revealing' : 'is-covering'}`)}
    style={{ '--brush-wipe-time': `${revealing ? introRevealTime : introCoverTime}ms` } as CSSProperties} aria-hidden="true">
    {!revealing && <>
      <div className={ui("brush-paste-scene")}>
        <img className={ui("brush-transition-brush")} src={toolArt.brush} alt="" draggable={false} />
        <div className={ui("brush-transition-tube")}><img src={toolArt.paste} alt="" draggable={false} /><span /></div>
        <span className={ui("brush-paste-stream")} />
      </div>
      <div className={ui("brush-paste-cover")} />
    </>}
  </div>
}

function ToothpasteSqueeze({ duration }: { duration: number }) {
  return <div className={ui("brush-squeeze")} style={{ '--brush-squeeze-time': `${duration}ms` } as CSSProperties} aria-hidden="true">
    <img className={ui("brush-squeeze-brush")} src={toolArt.brush} alt="" draggable={false} />
    <span className={ui("brush-squeezing-tube")}><img src={toolArt.paste} alt="" draggable={false} /></span>
    <span className={ui("brush-squeezing-stream")} />
    <span className={ui("brush-paste-dab")} />
  </div>
}

function SpitAnimation({ start }: { start: Point | null }) {
  return <svg className={ui("brush-spit-animation")} viewBox="0 0 100 66.667" aria-hidden="true"
    style={{ '--pour-start-x': `${start?.x ?? 71}px`, '--pour-start-y': `${start?.y ?? 29}px` } as CSSProperties}>
    <defs>
      <linearGradient id="brush-pour-water" x1="1" y1="0" x2="0" y2="1">
        <stop stopColor="#f3fbf8" stopOpacity=".9" />
        <stop offset=".42" stopColor="#bddbdc" stopOpacity=".6" />
        <stop offset="1" stopColor="#dcefeb" stopOpacity=".24" />
      </linearGradient>
      <linearGradient id="brush-runoff-water" x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#81b7bf" stopOpacity=".18" />
        <stop offset=".32" stopColor="#d5efed" stopOpacity=".68" />
        <stop offset=".56" stopColor="#fffef8" stopOpacity=".85" />
        <stop offset="1" stopColor="#8abfc5" stopOpacity=".3" />
      </linearGradient>
    </defs>
    <g className="brush-mouth-water">
      <path d="M59.4 21.8C55.2 21.9 51.4 24.1 49.8 28.6Q51.6 30.1 53.3 28.8C54.1 25.8 56.4 24.1 59.8 23.7Z" fill="url(#brush-pour-water)" stroke="#9bc8ca" strokeOpacity=".35" strokeWidth=".12" />
      <path className="brush-water-glint" d="M59.2 22.4C55.8 22.6 52.7 24.6 51.4 28.5" pathLength="1"
        fill="none" stroke="#fffef8" strokeOpacity=".9" strokeWidth=".4" strokeLinecap="round" />
      <path d="M58.7 23.3Q54.8 24.1 52.6 28.6" fill="none" stroke="#b0d8dc" strokeWidth=".32" />
      <ellipse cx="51.6" cy="29" rx="2.4" ry=".65" fill="#e4f3ef" fillOpacity=".7" />
      {[[-2.8, -1.5], [-1.4, -2.2], [1.7, -1.7], [3, -.8]].map(([x, y], index) =>
        <path key={x} className="brush-rinse-splash" d={`M${51.6 + x * .4} 28.8q${x * .5} ${y * 1.5} ${x} ${y}`}
          fill="none" stroke="#eaf7f4" strokeWidth=".3" strokeLinecap="round" style={{ animationDelay: `${650 + index * 70}ms` }} />)}
    </g>
    <g className="brush-rinse-runoff">
      <path d="M48.1 31.5Q50 32.6 53.1 31.5C52 38 50.1 39 50.7 45S49.1 53.1 50.3 58.5L48.8 58.5C48.1 52 49.7 49 48.6 44S49.5 36 48.1 31.5Z" fill="url(#brush-runoff-water)" />
      <path className="brush-water-glint" d="M50.6 33Q51.3 37 50 42T49.7 51L49.5 57.8" pathLength="1" fill="none" stroke="#fffef8" strokeOpacity=".8" strokeWidth=".25" strokeLinecap="round" />
      <path d="M45.8 31.4Q47.4 34.5 46.7 39.4M55 31.5Q53.4 35 54 38.1" fill="none" stroke="url(#brush-runoff-water)" strokeWidth=".6" strokeLinecap="round" />
    </g>
    <g className="brush-spit-pour">
      <image href={toolArt.water} x="-8" y="-9.1" width="16" height="18.2" />
    </g>
    {[[-5.2, .3, .54], [-3, 1.5, .78], [-1, .9, .55], [1.4, 1.6, .83], [3.2, .1, .48], [5.1, 1, .44], [-2, 1, .36], [2, .8, .5], [-.5, .2, .32], [3.6, .5, .35], [-3.8, .3, .4], [.6, 1, .6]].map(([x, y, radius], index) =>
      <ellipse key={x} className="brush-spit-drop" cx={50 + x} cy={29 + y} rx={radius} ry={radius * 1.2}
        fill="#fffdf4" stroke="#e0ebe2" strokeWidth=".12"
        style={{ '--spit-drift': `${-x * .65}px`, animationDelay: `${800 + index * 65}ms` } as CSSProperties} />)}
    <g className="brush-rinse-ripple" fill="none" stroke="#a4c6c4" strokeWidth=".16">
      <ellipse cx="49.5" cy="59" rx="3.7" ry=".8" />
      <ellipse cx="49.5" cy="59" rx="2.3" ry=".45" stroke="#fffef8" strokeWidth=".26" />
      <path d="M47.5 58.6q-1-1.9-2.1-1.7m6.1 1.7q.9-1.6 1.8-1.8" stroke="#d2e6e1" strokeWidth=".28" strokeLinecap="round" />
    </g>
  </svg>
}

type BrushCheckpoint = { step: number; amounts: number[]; started: boolean }

function saveCheckpoint(checkpoint: BrushCheckpoint) {
  try { localStorage.setItem(saveKey, JSON.stringify(checkpoint)) } catch { /* Storage can be unavailable. */ }
}

function readSave(): BrushCheckpoint {
  try {
    const data = JSON.parse(localStorage.getItem(saveKey) ?? 'null')
    if (data && Number.isInteger(data.step) && data.step >= 0 && data.step <= 10) {
      if (data.step >= 3 && data.step <= 6) return { step: 7, amounts: [0], started: true }
      const step = data.step === 10 ? 9 : data.step
      const length = rounds[step]?.spots.length ?? 4
      const savedAmounts: unknown[] = Array.isArray(data.amounts) ? data.amounts : []
      const amountAt = (index: number) => {
        const value = savedAmounts[index]
        return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(spotUnits, value)) : 0
      }
      return { step, started: data.started === true || step > 0, amounts: Array.from({ length }, (_, i) =>
        amountAt(length === 6 && savedAmounts.length === 4 ? expandedSpotIndexes[i] : i)) }
    }
  } catch { /* A new game also works with browser storage turned off. */ }
  return { step: 0, amounts: [0, 0, 0, 0], started: false }
}

function BrushTeeth() {
  const [startFresh] = useState(() => new URLSearchParams(window.location.search).get('start') === '1')
  const [saved] = useState<BrushCheckpoint>(() => startFresh ? { step: 0, amounts: [0, 0, 0, 0], started: false } : readSave())
  const [intro, setIntro] = useState<'face' | 'cover' | 'reveal' | 'game'>(saved.started ? 'game' : 'face')
  const [step, setStep] = useState(saved.step)
  const [amounts, setAmounts] = useState(saved.amounts)
  const [held, setHeld] = useState<Tool | null>(null)
  const [applyingPaste, setApplyingPaste] = useState(false)
  const [spitState, setSpitState] = useState<'ready' | 'spitting' | 'done'>('ready')
  const spitting = spitState === 'spitting'
  const spitDone = spitState === 'done'
  const [toolFeedback, setToolFeedback] = useState<{ tool: Tool | null; attempt: number } | null>(null)
  const picked = held === 'brush'
  const heldRef = useRef<Tool | null>(held)
  heldRef.current = held
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [retry, setRetry] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const cursor = useRef<HTMLDivElement>(null)
  const mousePosition = useRef<Point | null>(null)
  const scene = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLElement>(null)
  const skipPointerClick = useRef(false)
  const reset = useRef<HTMLDialogElement>(null)
  const homeTip = useRef<HTMLDialogElement>(null)
  const stepTitle = useRef<HTMLHeadingElement>(null)
  const focusGame = useRef(false)
  const spotButton = useRef<HTMLButtonElement>(null)
  const mouthTarget = useRef<HTMLButtonElement>(null)
  const rinseStart = useRef<Point | null>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const keyboardAdvance = useRef(false)
  const stroke = useRef<{ x: number; y: number; time: number } | null>(null)
  const started = intro !== 'face'
  const checkpoint = useRef({ step, amounts, started })
  checkpoint.current = { step, amounts, started }
  const round = rounds[step]
  const front = !round || round.view === 'mouth'
  const stepNumber = stepOrder.indexOf(step) + 1
  const requiredTool: Tool | null = step === 0 ? 'paste' : round ? 'brush' : step === 8 ? 'water' : null
  const spotIndex = amounts.findIndex(amount => amount < spotUnits)
  const spot = round?.spots[spotIndex]
  const complete = Boolean(round && !spot)
  const stepDone = complete || spitDone
  const rinsed = spitDone
  const finished = step === 9
  const total = amounts.reduce((sum, amount) => sum + amount, 0)
  const isLoadedBrush = step === 1 && total === 0
  const progressMax = round?.view === 'tongue' ? tongueRoundTime : toothRoundTime
  const roundUnits = (round?.spots.length ?? 1) * spotUnits
  const brushedPercent = total / roundUnits * 100
  const foamSpots = step >= 1 && step <= 8 && !spitDone
    ? [1, 2].flatMap(row => step < row ? [] : rounds[row]!.spots.map(({ x }, index) => {
      const lower = row === 2
      const fromCenter = Math.abs(x - 50) / 50
      const gumline = lower ? 78 - fromCenter * 11 : 28 + fromCenter * 9
      const pileY = (lower ? 58 : 48) - fromCenter * 3
      const jawY = (position: number) => step === 7 ? .89 * position + (lower ? 12.09 : -1.36) : position
      const behindTongue = step === 7 && lower && fromCenter < .3
      return {
        x: step === 7 ? 50 + (x - 50) * .94 : x,
        y: jawY(gumline),
        lower,
        // The tongue overlaps the middle of the lower row in the open mouth.
        pileY: jawY(pileY) + (step === 7 && lower ? Math.max(0, 8 - fromCenter * 12.5) : 0) + (behindTongue ? 4 : 0),
        level: behindTongue ? .36 : step > row ? 1 : (amounts[index] ?? 0) / spotUnits,
      }
    }))
    : []
  if (step === 7) {
    for (const x of [43, 53, 63]) {
      foamSpots.push({ x, y: 59, lower: false, pileY: 62, level: total / roundUnits * (x === 53 ? .35 : .65) })
    }
  }
  useEffect(() => {
    let active = true
    setLoaded(0)
    setError('')
    Promise.all(images.map(src => {
      const image = new Image()
      image.src = src
      return image.decode().then(() => { if (active) setLoaded(count => count + 1) })
    })).then(() => { if (active) setLoading(false) }, () => { if (active) setError('The pictures couldn’t load. Try again.') })
    return () => { active = false }
  }, [retry])

  useEffect(() => {
    if (!startFresh) return
    saveCheckpoint(checkpoint.current)
    const url = new URL(window.location.href)
    url.searchParams.delete('start')
    window.history.replaceState(window.history.state, '', url)
  }, [startFresh])

  // Save on a short debounce and immediately when leaving the page.
  useEffect(() => {
    const save = () => saveCheckpoint(checkpoint.current)
    const timeout = window.setTimeout(save, 200)
    window.addEventListener('pagehide', save)
    return () => { window.clearTimeout(timeout); window.removeEventListener('pagehide', save) }
  }, [step, amounts, started])

  useEffect(() => {
    if (!applyingPaste) return
    const timer = window.setTimeout(() => go(1), pasteSqueezeTime)
    return () => window.clearTimeout(timer)
  }, [applyingPaste])

  useEffect(() => {
    if (!spitting) return
    const timer = window.setTimeout(() => setSpitState('done'), spitTime)
    return () => window.clearTimeout(timer)
  }, [spitting])

  useEffect(() => {
    if (intro === 'game' && focusGame.current) {
      focusGame.current = false
      stepTitle.current?.focus()
    }
    if (intro !== 'cover' && intro !== 'reveal') return
    const covering = intro === 'cover'
    const timer = window.setTimeout(() => setIntro(covering ? 'reveal' : 'game'), covering ? introCoverTime : introRevealTime)
    return () => window.clearTimeout(timer)
  }, [intro])

  useEffect(() => {
    if (!picked) return
    const point = mousePosition.current
    if (point && cursor.current) showHeldTool(point)
    else if (!point) spotButton.current?.focus()
  }, [step, picked])

  useEffect(() => {
    if (!keyboardAdvance.current) return
    keyboardAdvance.current = false
    if (stepDone) nextButton.current?.focus()
    else (spotButton.current ?? stepTitle.current)?.focus()
  }, [intro, step, stepDone])

  function go(next: number) {
    const freshAmounts = Array<number>(rounds[next]?.spots.length ?? 4).fill(0)
    stroke.current = null
    skipPointerClick.current = false
    if (cursor.current) cursor.current.hidden = true
    setStep(next)
    setAmounts(freshAmounts)
    setHeld(next >= 1 && next <= 7 ? 'brush' : null)
    setToolFeedback(null)
    setApplyingPaste(false)
    setSpitState('ready')
    setError('')
    if (next === 0) {
      setIntro('face')
      checkpoint.current = { step: 0, amounts: freshAmounts, started: false }
      saveCheckpoint(checkpoint.current)
    }
  }

  function addTime(index: number, elapsed: number) {
    setAmounts(previous => {
      if (previous.findIndex(amount => amount < spotUnits) !== index) return previous
      return previous.map((amount, i) => i === index ? Math.min(spotUnits, amount + elapsed * roundUnits / progressMax) : amount)
    })
  }

  function move(event: PointerEvent<HTMLElement>) {
    if (!scene.current || !spot || !picked || loading) return
    const rect = scene.current.getBoundingClientRect()
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    keyboardAdvance.current = false
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const time = performance.now()
    const last = stroke.current
    stroke.current = { x, y, time }
    if (!last || Math.hypot(x - last.x, y - last.y) < 1) return
    if (step === 7 && y <= last.y) return
    const radiusX = rect.width * (spot.radius ?? spotRadius)
    const radiusY = spot.radiusY === undefined ? radiusX : rect.height * spot.radiusY
    const dx = (spot.x * rect.width / 100 - x) / radiusX
    const dy = (spot.y * rect.height / 100 - y) / radiusY
    if (Math.hypot(dx, dy) <= 1) addTime(spotIndex, Math.min(80, time - last.time))
  }

  function showToolFeedback(tool: Tool | null) {
    heldRef.current = null
    setHeld(null)
    hideHeldTool()
    setToolFeedback(previous => ({ tool, attempt: (previous?.attempt ?? 0) + 1 }))
  }

  function grab(tool: Tool) {
    if (tool !== requiredTool) {
      showToolFeedback(tool)
      return false
    }
    heldRef.current = tool
    setHeld(tool)
    setToolFeedback(null)
    return true
  }

  function useTool(tool: Tool | null) {
    if (applyingPaste || spitState !== 'ready' || (step !== 0 && step !== 8)) return
    if (tool !== requiredTool) { showToolFeedback(tool); return }
    if (step === 0) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { go(1); return }
      setApplyingPaste(true)
      setHeld(null)
      setToolFeedback(null)
    } else {
      heldRef.current = null
      setHeld(null)
      setToolFeedback(null)
      setSpitState(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'done' : 'spitting')
    }
  }

  function showHeldTool(point: Point) {
    if (!cursor.current) return
    cursor.current.hidden = false
    cursor.current.style.transform = `translate(${point.x}px, ${point.y}px) rotate(var(--held-angle, 0deg))`
  }

  function positionTool(event: PointerEvent<HTMLElement>) {
    if (!stage.current) return
    const rect = stage.current.getBoundingClientRect()
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    const inside = point.x >= 0 && point.y >= 0 && point.x < rect.width && point.y < rect.height
    mousePosition.current = inside && event.pointerType === 'mouse' ? point : null
    if (inside && heldRef.current) showHeldTool(point)
    else if (cursor.current) cursor.current.hidden = true
  }

  function hideHeldTool() {
    mousePosition.current = null
    if (cursor.current) cursor.current.hidden = true
  }

  const toothpasteTarget = step === 0 && !applyingPaste ? (held === 'paste' ? 'brush' : 'paste') : null

  function counterTool(tool: Tool) {
    const wrongItem = toolFeedback?.tool === tool
    const guided = toothpasteTarget === tool
    return <button className={ui(`brush-counter-tool brush-counter-${tool}`)} data-wrong={wrongItem} data-brush-target={step === 0 && tool === 'brush' ? '' : undefined} aria-label={step === 0 && tool === 'brush' && held === 'paste' ? 'Put toothpaste on the toothbrush' : `Pick up ${tool === 'brush' ? 'toothbrush' : tool === 'paste' ? 'toothpaste' : 'glass of water'}`} aria-pressed={held === tool} aria-disabled={applyingPaste || undefined} disabled={step === 9 || stepDone || spitting}
      onClick={event => {
        const handled = skipPointerClick.current && event.detail > 0
        skipPointerClick.current = false
        if (handled || applyingPaste) return
        if (step === 0 && tool === 'brush' && held === 'paste') { useTool('paste'); return }
        if (grab(tool) && step === 8 && event.detail === 0) mouthTarget.current?.focus()
      }}
      onPointerDown={event => {
        if (event.button !== 0 || !event.isPrimary || applyingPaste) return
        skipPointerClick.current = false
        if (step === 0 && tool === 'brush' && held === 'paste') {
          useTool('paste')
          skipPointerClick.current = true
          return
        }
        event.preventDefault()
        if (!grab(tool)) { skipPointerClick.current = true; return }
        event.currentTarget.setPointerCapture(event.pointerId)
        stroke.current = null
      }}
      onPointerMove={event => { positionTool(event); move(event) }}
      onPointerCancel={() => { stroke.current = null }}
      onPointerUp={event => {
        stroke.current = null
        if (event.pointerType === 'mouse') positionTool(event)
        else hideHeldTool()
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-brush-target]')
        if (target && heldRef.current === tool && !applyingPaste) {
          useTool(tool)
          skipPointerClick.current = true
        }
      }}>
      <img src={toolArt[tool]} alt="" draggable={false} />
      {tool === 'brush' && isLoadedBrush && <span className={ui("brush-bristle-tip")} aria-hidden="true">
        <span className={ui("brush-paste-dab")} />
      </span>}
      <span className={ui("brush-tool-label")}>{guided ? (tool === 'brush' ? 'Tap toothbrush' : 'Tap toothpaste') : tool === 'brush' ? 'Toothbrush' : tool === 'paste' ? 'Toothpaste' : 'Water'}</span>
      {wrongItem && <b key={toolFeedback.attempt} className={ui("activity-tool-x")} aria-hidden="true">×</b>}
    </button>
  }

  const title = step === 0 ? 'Add toothpaste' : step === 8 ? 'Spit out the toothpaste' : round?.title
  const hint = step === 0 ? applyingPaste ? 'A little toothpaste goes on the brush.' : held === 'paste' ? 'Now tap the toothbrush.' : 'Tap the toothpaste first. Then tap the toothbrush.'
    : step === 8 ? spitDone ? 'All done! Great brushing.' : spitting ? 'Spit gently into the sink.' : held === 'water' ? 'Tap the mouth to spit out the toothpaste.' : 'Pick up the glass of water.'
      : picked || complete || toolFeedback ? round?.hint : 'Tap the toothbrush. Then brush where you see the circle.'
  const toolHint = requiredTool === 'paste' ? 'Use the toothpaste first.'
    : requiredTool === 'brush' ? 'Pick up the toothbrush to keep brushing.'
      : 'Pick up the glass of water.'

  if (loading) return <ActivityLoading label="Getting your toothbrush ready…" loaded={loaded} total={images.length}
    error={error} onRetry={() => setRetry(value => value + 1)} />

  const introWipe = (intro === 'cover' || intro === 'reveal') && <ToothpasteTransition revealing={intro === 'reveal'} />

  if (intro === 'face' || intro === 'cover' || finished) return <main className={ui("wash-page")} inert={intro === 'cover'}>
    <InkFilters />
    <a href="/" className={ui("wash-back")} aria-label="Back to home"><svg className={ui("ink-wiggle")} viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M29 18c-5 1-14 0-22 0m0 0 8-8m-8 8 8 8" /></svg></a>
    <div className={ui("brush-welcome-scene")}>
      <CleanBathScene smile={finished ? 'after-brushing' : 'before-brushing'} />
      <div className={ui("message-box")}>
        <h1 ref={stepTitle} tabIndex={-1} className={ui("ink-wiggle")}>{finished ? <>All clean!<br />Ready to smile!</> : <>Bath done!<br />Brush time!</>}</h1>
        <p>{finished ? 'You washed up and brushed your teeth. Great job taking care of yourself!' : 'Uh-oh, a little bad breath! Let’s brush for clean teeth and fresher breath.'}</p>
        {finished ? <button className={ui("cta cta-brush")} onClick={event => { keyboardAdvance.current = event.detail === 0; go(0) }}>Play again</button> : <button className={ui("cta cta-brush")} disabled={intro === 'cover'} onClick={event => {
          focusGame.current = event.detail === 0
          setIntro(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'game' : 'cover')
        }}>Let’s brush our teeth</button>}
      </div>
    </div>
    {introWipe}
  </main>

  return <main className={ui("brush-page brush-activity")} inert={intro === 'reveal'}>
    <InkFilters />
    <a href="/" className={ui("brush-back")} aria-label="Back to home"><svg className={ui("ink-wiggle")} viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M29 18c-5 1-14 0-22 0m0 0 8-8m-8 8 8 8" /></svg></a>
    <div className={ui("brush-layout")}>
      <div className={ui("brush-scene-frame")}>
        <section ref={stage} className={ui("brush-stage brush-sink-stage")} data-applying-paste={applyingPaste} data-spitting={spitting} aria-busy={applyingPaste || spitting} aria-label="Toothbrushing game" onPointerMove={positionTool} onPointerLeave={hideHeldTool}>
          {round && <p id="brush-keyboard-hint" className={ui("brush-keyboard-hint")}>
            {step === 7 ? 'Hold the down arrow to brush.' : 'Hold an arrow key to brush.'}
          </p>}
          <div ref={scene} className={ui(`brush-picture brush-${round?.view ?? 'mouth'}`)}
            onPointerDown={event => {
              if (!round || !picked || complete || event.button !== 0 || !event.isPrimary) return
              event.preventDefault()
              event.currentTarget.setPointerCapture(event.pointerId)
              stroke.current = null
              move(event)
            }} onPointerMove={move} onLostPointerCapture={() => { stroke.current = null }}>
            {front ? <>
              <img src={frontArt} alt="Top and bottom teeth with pink gums" draggable={false} />
              <ToothCoating step={step} progress={amounts.map(amount => amount / spotUnits)} rinsed={rinsed} />
            </> : <TongueMouth progress={total / roundUnits} />}
            {foamSpots.length > 0 && <ToothpasteFoam spots={foamSpots} />}
            {step === 8 && spitState === 'ready' && <button ref={mouthTarget} type="button" className={ui("brush-rinse-mouth")}
              data-ready={held === 'water'} aria-label="Spit out the toothpaste" aria-describedby="brush-technique"
              onClick={event => {
                keyboardAdvance.current = event.detail === 0 && heldRef.current === 'water'
                const rect = stage.current?.getBoundingClientRect()
                rinseStart.current = event.detail && rect?.width
                  ? { x: (event.clientX - rect.left) * 100 / rect.width, y: (event.clientY - rect.top) * 100 / rect.width }
                  : null
                useTool(heldRef.current)
              }} />}
            {rinsed && <><ToothRowShine upper /><ToothRowShine upper={false} /></>}
            {spot && <button ref={spotButton} type="button" className={ui("brush-zone")} style={{
              left: spot.x + '%',
              top: spot.y + '%',
              width: `${200 * (spot.radius ?? spotRadius)}%`,
              height: spot.radiusY === undefined ? undefined : `${200 * spot.radiusY}%`,
            }}
              aria-label={`Brush spot ${spotIndex + 1}: ${spot.label.toLowerCase()}`} aria-describedby="brush-keyboard-hint brush-technique" disabled={!picked}
              onKeyDown={event => {
                if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return
                event.preventDefault()
                if (step === 7 && event.key !== 'ArrowDown') return
                keyboardAdvance.current = true
                addTime(spotIndex, 80)
              }} />}
          </div>
          {spitting && <SpitAnimation start={rinseStart.current} />}
          <div className={ui("brush-counter-tools")} role="group" aria-label="Grab a brushing tool">
            <div className={ui("brush-organizer")}>
              <img className={ui("brush-organizer-art")} src={organizerArt} alt="" draggable={false} />
              {counterTool('brush')}
              {counterTool('paste')}
              <img className={ui("brush-organizer-art brush-organizer-front")} src={organizerArt} alt="" draggable={false} />
            </div>
            {counterTool('water')}
          </div>
          {applyingPaste && <ToothpasteSqueeze duration={pasteSqueezeTime} />}
          {held && <div ref={cursor} className={ui(`brush-held brush-held-${held}`)} data-pose={held === 'brush' ? 'contact' : undefined}
            data-tongue={held === 'brush' && step === 7} hidden aria-hidden="true">
            <img src={held === 'brush' ? '/brush-contact.webp' : toolArt[held]} alt="" />
            <span className={ui("brush-grip")} />
          </div>}

        </section>
      </div>
      <section className={ui("brush-panel brush-simple-panel")} aria-labelledby="brush-title">
        <div className={ui("brush-step-label")}>
          <img src={step === 0 ? toolArt.paste : step === 8 ? toolArt.water : '/brush-front.webp'} alt="" />
          <span>Step <strong>{stepNumber}</strong> of {stepOrder.length}</span>
        </div>
        <h1 id="brush-title" ref={stepTitle} tabIndex={-1} className={ui("ink-wiggle")}>{title}</h1>
        <p id="brush-technique" className={ui("brush-hint")} aria-live={step === 0 || step === 8 ? 'polite' : undefined}>{hint}</p>
        {round && <div className={ui("brush-progress")}>
          {spot && round.spots.length > 1 && <span className={ui("brush-current-spot")} role="status">Spot {spotIndex + 1} of {round.spots.length} · {spot.label}</span>}
          <strong>{Math.floor(brushedPercent)}% brushed</strong>
          <progress aria-label={title} value={brushedPercent} max={100} />
        </div>}
        <p className={ui("brush-status activity-feedback")} data-wrong={Boolean(toolFeedback)} data-done={stepDone} role="status">{toolFeedback ? toolHint : stepDone ? 'Nice work!' : ''}</p>
        <div className={ui("brush-actions")}>
          {stepDone && <>
            <button ref={nextButton} className={ui("cta cta-brush")} onClick={event => { keyboardAdvance.current = event.detail === 0; go(spitDone ? 9 : stepOrder[stepNumber]) }}>{spitDone ? 'Finish' : 'Next step'}</button>
            <button className={ui("cta brush-retry")} onClick={event => { keyboardAdvance.current = event.detail === 0; go(step) }}>Try again</button>
            {step === 2 && <button type="button" className={ui("brush-tip-button")} aria-haspopup="dialog" onClick={() => homeTip.current?.showModal()}>
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M12 2.5a6.5 6.5 0 0 0-4.7 11c.8.9 1.5 1.8 1.7 3h6c.2-1.2.9-2.1 1.7-3A6.5 6.5 0 0 0 12 2.5Z" />
                <path d="M9.5 19h5M10.5 21.5h3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <span>Home tip</span>
            </button>}
          </>}
        </div>
      </section>
      <div className={ui("brush-activity-footer")}>
        <button className={ui("brush-reset")} disabled={applyingPaste || spitting} onClick={() => reset.current?.showModal()}>Start over</button>
      </div>
    </div>
    <dialog ref={reset} className={ui("wash-reset-dialog")} aria-labelledby="brush-reset-title" aria-describedby="brush-reset-description">
      <h2 id="brush-reset-title" className={ui("ink-wiggle")}>Start over?</h2>
      <p id="brush-reset-description">You’ll go back to the “Brush time!” screen and start fresh.</p>
      <div className={ui("wash-actions")}>
        <button className={ui("cta cta-brush")} autoFocus onClick={() => reset.current?.close()}>Keep playing</button>
        <button className={ui("cta cta-brush-outline")} onClick={event => {
          reset.current?.close()
          keyboardAdvance.current = event.detail === 0
          go(0)
        }}>Start over</button>
      </div>
    </dialog>
    <dialog ref={homeTip} className={ui("wash-reset-dialog brush-tip-dialog")} aria-labelledby="brush-home-tip-title" aria-describedby="brush-home-tip-body">
      <h2 id="brush-home-tip-title">Brush every side</h2>
      <p id="brush-home-tip-body">Brush the outside and inside of each tooth. Then brush the bumpy parts you chew with.</p>
      <form method="dialog" className={ui("wash-actions")}>
        <button className={ui("cta cta-brush")} autoFocus>Got it</button>
      </form>
    </dialog>
    {introWipe}
  </main>
}

createRoot(document.getElementById('root')!).render(<BrushTeeth />)
