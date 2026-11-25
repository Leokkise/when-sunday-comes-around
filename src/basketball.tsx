import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { ActivityEntry } from './activity-loading'
import { InkFilters } from './ink-filters'
import { BasketballNet } from './basketball-net'
import { aimFromPointer, aimGuide, courtSize, defaultAim, floorY, hoopPlacement, hoopPoint, playerPosition, shootingSpots, shotStep, traceShot, type Point, type ShotFrame } from './basketball-shot'
import { loadImage } from './image-loading'
import { ui } from './ui-classes'
import courtArt from '../assets/basketball/court-soft.avif'
import hoopArt from '../assets/basketball/hoop-soft.webp'
import ballArt from '../assets/basketball/ball-soft.webp'
import readyArt from '../assets/basketball/player-ready.webp'
import shootingArt from '../assets/basketball/player-shoot.webp'
import dryLeafArt from '../assets/basketball/dry-leaf.webp'

const openingArt = [courtArt, hoopArt, ballArt, readyArt]
const shotLimit = 15
const basketGoal = 10
const retryTitle = 'Give it another shot!'
const frontRim = hoopPoint(660, 390)
const leaves = Array.from({ length: 7 }, (_, index) => {
  const duration = 11 + index % 5
  return {
    left: `${7 + index * 14}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${-duration * ((index * 7 + 3) % 17) / 17}s`,
    '--leaf-drift': `${(index % 2 ? 1 : -1) * (3 + index % 4)}cqw`,
    '--leaf-size': `${3.1 + (index % 3) * .5}cqw`,
  } as CSSProperties
})

function roundIsOver(shots: number, baskets: number) {
  return shots === shotLimit || baskets + shotLimit - shots < basketGoal
}

function position(x: number, y: number, width?: number) {
  return {
    left: (x / courtSize.width * 100) + '%',
    top: (y / courtSize.height * 100) + '%',
    width: width === undefined ? undefined : (width / courtSize.width * 100) + '%',
  }
}

function Basketball() {
  const [aim, setAim] = useState(defaultAim)
  const [phase, setPhase] = useState<'ready' | 'preparing' | 'shooting'>('ready')
  const [message, setMessage] = useState('')
  const [round, setRound] = useState({ shots: 0, baskets: 0, spot: 0 })
  const [flight, setFlight] = useState<ShotFrame | null>(null)
  const busy = useRef(false)
  const frameId = useRef(0)
  const court = useRef<HTMLButtonElement>(null)
  const replay = useRef<HTMLButtonElement>(null)
  const complete = roundIsOver(round.shots, round.baskets)
  const won = round.baskets >= basketGoal
  const canShoot = phase === 'ready' && !complete
  const shotsLeft = shotLimit - round.shots
  const playerX = shootingSpots[round.spot]
  const { dots, curve } = useMemo(() => aimGuide(aim, playerX), [aim, playerX])
  const aimPosition = position(aim.x, aim.y)

  useEffect(() => () => cancelAnimationFrame(frameId.current), [])
  useEffect(() => { if (complete) replay.current?.focus() }, [complete])

  function prepareShot() {
    void loadImage(shootingArt).catch(() => {})
  }

  function pointerAim(event: PointerEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    return aimFromPointer((event.clientX - bounds.left) / bounds.width * courtSize.width,
      (event.clientY - bounds.top) / bounds.height * courtSize.height)
  }

  async function shoot(target: Point) {
    if (busy.current || !canShoot) return
    busy.current = true
    setPhase('preparing')
    setMessage('')
    try {
      await loadImage(shootingArt)
    } catch {
      setPhase('ready')
      setMessage('Couldn’t load the shot. Tap the court to retry.')
      busy.current = false
      return
    }

    const { frames, made } = traceShot(target, playerX)
    function finish() {
      const shots = round.shots + 1
      const baskets = round.baskets + Number(made)
      const offset = 1 + Math.floor(Math.random() * (shootingSpots.length - 1))
      setRound({ shots, baskets, spot: (round.spot + offset) % shootingSpots.length })
      setFlight(null)
      setPhase('ready')
      setMessage(roundIsOver(shots, baskets)
        ? `${baskets >= basketGoal ? 'Challenge complete!' : retryTitle} ${baskets} of ${shots} shots made.`
        : `${made ? 'Basket!' : 'Miss.'} ${baskets} baskets, ${shotLimit - shots} shots left.`)
      busy.current = false
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return
    }

    setPhase('shooting')
    setFlight(frames[0])
    const start = performance.now()
    function animate(now: number) {
      const index = Math.floor((now - start) / (shotStep * 1000))
      if (index >= frames.length) {
        finish()
        return
      }
      setFlight(frames[index])
      frameId.current = requestAnimationFrame(animate)
    }
    frameId.current = requestAnimationFrame(animate)
  }

  function restart() {
    setRound({ shots: 0, baskets: 0, spot: 0 })
    setAim(defaultAim)
    setMessage('')
    court.current?.focus()
  }

  const ball = flight ?? { x: playerX + 67, y: playerPosition.y + 110 }
  const netFrame = flight && (flight.touchingNet || Math.abs(flight.netSway) >= .05 || Math.abs(flight.netStretch) >= .001) ? flight : null

  return <main className={ui('hoops-page')}>
    <InkFilters />
    <a className={ui('brush-back')} href="/" aria-label="Back to When Sunday Comes Around">
      <svg className={ui('ink-wiggle')} viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M29 18c-5 1-14 0-22 0m0 0 8-8m-8 8 8 8" /></svg>
    </a>
    <h1 className="sr-only">After-School Hoops</h1>
    <div className={ui('hoops-challenge')}>
      <div className={ui('hoops-score')} data-complete={complete} role="group" aria-label="Round score">
        <strong>{basketGoal} to win</strong>
        <span>{round.baskets} {round.baskets === 1 ? 'basket' : 'baskets'} made</span>
        <span>{shotsLeft} {shotsLeft === 1 ? 'shot' : 'shots'} left</span>
      </div>
      <button ref={court} type="button" className={ui('hoops-stage')} aria-label="Aim and shoot the basketball"
        aria-describedby="hoops-hint" aria-disabled={!canShoot} tabIndex={complete ? -1 : 0} data-phase={phase}
        onPointerEnter={prepareShot} onFocus={prepareShot}
        onPointerMove={event => { if (canShoot) setAim(pointerAim(event)) }}
        onPointerDown={event => {
          if (!canShoot || !event.isPrimary || event.button !== 0) return
          setAim(pointerAim(event))
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerUp={event => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
          event.currentTarget.releasePointerCapture(event.pointerId)
          if (!canShoot) return
          const target = pointerAim(event)
          setAim(target)
          void shoot(target)
        }}
        onClick={event => { if (canShoot && event.detail === 0) void shoot(aim) }}
        onKeyDown={event => {
          const offsets: Record<string, Point> = { ArrowLeft: { x: -10, y: 0 }, ArrowRight: { x: 10, y: 0 }, ArrowUp: { x: 0, y: -10 }, ArrowDown: { x: 0, y: 10 } }
          const offset = offsets[event.key]
          if (!offset) return
          event.preventDefault()
          if (canShoot) setAim(current => aimFromPointer(current.x + offset.x, current.y + offset.y))
        }}>
        <img src={courtArt} alt="" width="1672" height="941" className={ui('hoops-court-art')} draggable={false} />
        <span className={ui('hoops-leaves')} aria-hidden="true">
          {leaves.map((style, index) => <img key={index} src={dryLeafArt} alt="" className={ui('hoops-leaf')} style={style} draggable={false} />)}
        </span>
        <img src={hoopArt} alt="" className={ui('hoops-sprite z-[2]')} style={{
          ...position(hoopPlacement.x, hoopPlacement.y, hoopPlacement.width),
          height: (hoopPlacement.height / courtSize.height * 100) + '%',
        }} draggable={false} />
        <BasketballNet frame={netFrame} front={false} />
        <img src={phase === 'shooting' ? shootingArt : readyArt} alt="" className={ui('hoops-sprite z-[3]')} style={position(playerX, playerPosition.y, 270)} draggable={false} />
        {flight && <span className={ui('hoops-shadow')} style={{ ...position(ball.x, floorY + 35, 82), opacity: .08 + .14 * Math.max(0, 1 - (floorY - ball.y) / 500) }} aria-hidden="true" />}
        <img src={ballArt} alt="" className={ui('hoops-sprite hoops-ball')} data-ball style={{ ...position(ball.x, ball.y, 84),
          zIndex: flight?.inNet ? 3 : 6,
          rotate: (flight?.rotation ?? 0) + 'deg',
        }} draggable={false} />
        <BasketballNet frame={netFrame} front />
        <svg className={ui('hoops-rim-front')} viewBox="660 390 340 55" preserveAspectRatio="none" style={{
          ...position(frontRim.x, frontRim.y, 340 / 1024 * hoopPlacement.width),
          height: (55 / 1536 * hoopPlacement.height / courtSize.height * 100) + '%',
        }} aria-hidden="true">
          <image href={hoopArt} width="1024" height="1536" />
        </svg>
        {canShoot && <>
          <svg className={ui('hoops-aim-curve')}
            viewBox={`0 0 ${courtSize.width} ${courtSize.height}`} aria-hidden="true"
            style={{ maskImage: `radial-gradient(circle var(--aim-ring-radius) at ${aimPosition.left} ${aimPosition.top}, transparent calc(100% - 2px), #000 calc(100% - 1px))` }}>
            <path d={`M${curve.start.x} ${curve.start.y} Q${curve.control.x} ${curve.control.y} ${curve.finish.x} ${curve.finish.y}`}
              fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          {dots.map((dot, index) => <span key={index} className={ui('hoops-dot')} style={position(dot.x, dot.y, 18)} aria-hidden="true" />)}
          <span className={ui('hoops-dot hoops-aim-ring')} style={aimPosition} aria-hidden="true" />
        </>}
        {!round.shots && !flight && <span className={ui('hoops-hint')} aria-hidden="true">Aim high, then click to shoot</span>}
      </button>
      {complete && <div className={ui('hoops-result')}>
        <div className={ui('hoops-result-card')} data-won={won}>
          <h2>{won ? 'Challenge complete!' : retryTitle}</h2>
          <p>{won ? `${round.baskets} of ${round.shots} shots made` : `You made ${round.baskets}. Aim for ${basketGoal} baskets!`}</p>
          <button type="button" ref={replay} className={ui('cta')} onClick={restart}>Play again</button>
        </div>
      </div>}
    </div>
    <p id="hoops-hint" className="sr-only">Aim the circle above the basket, then click or tap to shoot. Use the arrow keys to aim and Enter or Space to shoot.</p>
    <p className={ui('hoops-feedback')} role="status">{message.startsWith('Couldn’t') ? message : <span className="sr-only">{message}</span>}</p>
  </main>
}

createRoot(document.getElementById('root')!).render(
  <ActivityEntry assets={openingArt} label="Getting the court ready…" errorMessage="The court couldn’t load.">
    <Basketball />
  </ActivityEntry>,
)
