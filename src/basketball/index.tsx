import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { ActivityEntry } from '../activity-loading'
import { InkFilters } from '../ink-filters'
import { BasketballNet } from './net'
import { BasketballPlayer, characterArt } from './player'
import { BasketballProgress } from './progress'
import { zoomOutLayout } from './viewport'
import { loadImage } from '../image-loading'
import { aimFromPointer, aimGuide, canAimForward, ballRadius, courtSize, defaultAim, floorY, hoopPlacement, hoopPoint, playerPosition, rim, shootingSpots, shotStep, traceShot, type Point, type ShotFrame } from './shot'
import { heldBallKeyframes, playerSpriteWidth, playerSpriteXOffset, playerSpriteYOffset, shotReleaseTick, shotTicks, walkFrameCount } from './character-frames'
import { ui } from '../ui-classes'
import courtArt from '../../assets/basketball/scene/court-soft.avif'
import hoopArt from '../../assets/basketball/scene/hoop-soft.webp'
import ballArt from '../../assets/basketball/scene/ball-soft.webp'
import dryLeafArt from '../../assets/basketball/scene/dry-leaf.webp'
import swishArt from '../../assets/basketball/scene/rim-accent.webp'

import releaseSound from '../../assets/basketball/audio/release.wav'
import stepSound from '../../assets/basketball/audio/step.wav'
import bounceSound from '../../assets/basketball/audio/bounce.wav'
import basketSound from '../../assets/basketball/audio/basket.wav'

import boardSound from '../../assets/basketball/audio/board.wav'
import rimSound from '../../assets/basketball/audio/rim.wav'

const sounds = { board: boardSound, rim: rimSound, release: releaseSound, step: stepSound, bounce: bounceSound, basket: basketSound }
function playCue(name: keyof typeof sounds, volume = .42) {
  const audio = new Audio(sounds[name])
  audio.volume = volume
  void audio.play().catch(() => {})
}

const openingArt = [courtArt, hoopArt, ballArt, characterArt[0]]
const [, idleBallX, idleBallY] = heldBallKeyframes[0]
const basketGoal = 10
const frontRim = hoopPoint(660, 390)
const tutorialSteps = [
  { label: 'Aim above the hoop.', art: hoopArt },
  { label: 'Tap or click to shoot.', art: null },
  { label: 'Make 10 baskets. Keep trying!', art: ballArt },
]
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

function position(x: number, y: number, width?: number) {
  return {
    left: (x / courtSize.width * 100) + '%',
    top: (y / courtSize.height * 100) + '%',
    width: width === undefined ? undefined : (width / courtSize.width * 100) + '%',
  }
}

function Basketball() {
  const [viewport, setViewport] = useState(() => zoomOutLayout(window.innerWidth, window.innerHeight, window.outerWidth))
  const [aim, setAim] = useState(defaultAim)
  const [phase, setPhase] = useState<'ready' | 'aiming' | 'windup' | 'release' | 'watch' | 'moving'>('ready')
  const [started, setStarted] = useState(false)
  const [animationFrame, setAnimationFrame] = useState(0)
  const [walkingRight, setWalkingRight] = useState(false)
  const [characterLoad, setCharacterLoad] = useState<'loading' | 'error' | null>(null)
  const [message, setMessage] = useState('')
  const [round, setRound] = useState({ shots: 0, baskets: 0, spot: 0 })
  const [flight, setFlight] = useState<ShotFrame | null>(null)
  const [movingX, setMovingX] = useState<number | null>(null)
  const [madeBasket, setMadeBasket] = useState(false)
  const [dribbleTime, setDribbleTime] = useState<number | null>(null)
  const ballPointer = useRef<number | null>(null)
  const busy = useRef(false)
  const frameId = useRef(0)
  const court = useRef<HTMLButtonElement>(null)
  const replay = useRef<HTMLButtonElement>(null)
  const tutorial = useRef<HTMLDialogElement>(null)
  const complete = round.baskets >= basketGoal
  const canShoot = started && characterLoad !== 'loading' && dribbleTime === null && (phase === 'ready' || phase === 'aiming') && !complete
  const shotInProgress = phase === 'windup' || phase === 'release' || phase === 'watch' || phase === 'moving'
  const basketsShown = round.baskets + Number(shotInProgress && madeBasket)
  const playerX = shootingSpots[round.spot]
  const forwardAim = canAimForward(aim, playerX)
  const { dots, curve } = useMemo(() => aimGuide(aim, playerX, {
    x: playerX + idleBallX, y: playerPosition.y + idleBallY,
  }), [aim, playerX])
  const aimPosition = position(aim.x, aim.y)

  useEffect(() => () => cancelAnimationFrame(frameId.current), [])
  useEffect(() => {
    const resize = () => setViewport(zoomOutLayout(window.innerWidth, window.innerHeight, window.outerWidth))
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])
  useEffect(() => { if (complete) replay.current?.focus() }, [complete])
  useEffect(() => { tutorial.current?.showModal() }, [])
  useEffect(() => {
    if (!started) return
    court.current?.focus()
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void Promise.all(characterArt.map(loadImage)).catch(() => {})
    }
  }, [started])

  function pointerAim(event: PointerEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    return aimFromPointer((event.clientX - bounds.left) / bounds.width * courtSize.width,
      (event.clientY - bounds.top) / bounds.height * courtSize.height)
  }

  function dribble() {
    if (!canShoot || busy.current) return
    setMessage('Dribble.')
    let bounced = false
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    busy.current = true
    const start = performance.now()
    function animate(now: number) {
      const progress = (now - start) / 800
      if (progress >= .46 && !bounced) { bounced = true; playCue('bounce') }
      if (progress >= 1) {
        setDribbleTime(null)
        busy.current = false
        return
      }
      setDribbleTime(progress)
      frameId.current = requestAnimationFrame(animate)
    }
    setDribbleTime(0)
    frameId.current = requestAnimationFrame(animate)
  }

  async function shoot(target: Point) {
    if (busy.current || !canShoot) return
    if (!canAimForward(target, playerX)) {
      setMessage('Aim toward the hoop to shoot.')
      return
    }
    busy.current = true
    setCharacterLoad('loading')
    try {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        await Promise.all(characterArt.map(loadImage))
      }
    } catch {
      busy.current = false
      setCharacterLoad('error')
      setMessage('The character couldn’t load. Try your shot again.')
      return
    }
    setCharacterLoad(null)
    setMessage('')
    setMadeBasket(false)

    const { frames, impacts, made } = traceShot(target, playerX)
    const shots = round.shots + 1
    const baskets = round.baskets + Number(made)
    const lastShot = baskets >= basketGoal
    const offset = 1 + Math.floor(Math.random() * (shootingSpots.length - 1))
    const spot = lastShot ? round.spot : (round.spot + offset) % shootingSpots.length
    const nextX = shootingSpots[spot]
    function finish() {
      setRound({ shots, baskets, spot })
      setFlight(null)
      setMovingX(null)
      setPhase('ready')
      setAnimationFrame(0)
      setMessage(lastShot ? 'All ten baskets made! Challenge complete!' : `${made ? 'Basket!' : 'Try again.'} ${baskets} of ${basketGoal} baskets made.`)
      busy.current = false
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      playCue(made ? 'basket' : 'release')
      setMadeBasket(made)
      finish()
      return
    }

    const windupMs = 190
    const releaseMs = 125
    const moveMs = Math.min(820, 300 + Math.abs(nextX - playerX) * .33)
    const walkCycles = Math.max(1, Math.round(moveMs / 480))
    setAnimationFrame(0)
    setPhase('windup')
    const start = performance.now()
    let movingSince: number | undefined
    let scored = false
    let nextImpact = 0
    let previousFrame = -1
    let previousStep = -1
    function animate(now: number) {
      const elapsed = now - start - windupMs
      if (movingSince === undefined) {
        const tick = elapsed < 0
          ? 1 + (shotReleaseTick - 1) * Math.max(0, 1 + elapsed / windupMs)
          : shotReleaseTick + elapsed * .12
        const nextFrame = shotTicks.findIndex(frame => frame > tick)
        setAnimationFrame(nextFrame < 0 ? shotTicks.length - 1 : nextFrame - 1)
      }
      if (elapsed < 0) {
        frameId.current = requestAnimationFrame(animate)
        return
      } else if (movingSince !== undefined) {
        const progress = Math.min(1, (now - movingSince) / moveMs)
        if (progress === 1) return finish()
        const step = Math.floor((now - movingSince) / 170)
        if (step !== previousStep) { playCue('step', .32); previousStep = step }
        setMovingX(playerX + (nextX - playerX) * (progress * progress * (3 - 2 * progress)))
        setAnimationFrame(Math.floor(progress * walkCycles * walkFrameCount) % walkFrameCount)
      } else {
        const index = Math.floor(elapsed / (shotStep * 1000))
        const frame = frames[Math.min(index, frames.length - 1)]
        if (previousFrame < 0) playCue('release')
        while (nextImpact < impacts.length && impacts[nextImpact].step <= index) {
          const impact = impacts[nextImpact++]
          playCue(impact.surface, impact.volume)
        }
        for (let i = Math.max(1, previousFrame + 1); i <= Math.min(index, frames.length - 1); i++) {
          if (frames[i].y === floorY && frames[i - 1].y < floorY) {
            playCue('bounce', Math.min(.55, (frames[i].squash ?? .1) * 3))
            break
          }
        }
        previousFrame = index
        if (made && !scored && index >= scoreFrame) {
          scored = true
          playCue('basket')
          setMadeBasket(true)
        }
        const outOfView = elapsed > 600 && wallExit !== -1 && index >= wallExit
        if (index >= frames.length || outOfView) {
          setFlight(null)
          if (lastShot) return finish()
          setMovingX(playerX)
          setPhase('moving')
          setWalkingRight(nextX > playerX)
          setAnimationFrame(0)
          movingSince = now
        } else {
          setPhase(elapsed < releaseMs ? 'release' : 'watch')
          setFlight(frame)
        }
      }
      frameId.current = requestAnimationFrame(animate)
    }
    const scoreFrame = frames.findIndex(frame => frame.inNet)
    const wallExit = frames.findIndex((frame, index) => {
      const previous = frames[index - 1]
      return previous && ((frame.x < -ballRadius && frame.x < previous.x) ||
        (frame.x > courtSize.width + ballRadius && frame.x > previous.x))
    })
    frameId.current = requestAnimationFrame(animate)
  }

  function restart() {
    setRound({ shots: 0, baskets: 0, spot: 0 })
    setAim(defaultAim)
    setMessage('')
    setMadeBasket(false)
    court.current?.focus()
  }

  const drawX = movingX ?? playerX
  const handY = playerPosition.y + idleBallY
  const bounce = dribbleTime === null ? 0 : Math.min(1, Math.min(dribbleTime, 1 - dribbleTime) / .46)
  const ball = flight ?? { x: drawX + idleBallX, y: handY + (floorY - handY) * bounce ** 2 }
  const netFrame = flight && (flight.touchingNet || Math.abs(flight.netSway) >= .05 || Math.abs(flight.netStretch) >= .001) ? flight : null
  const holding = (phase === 'ready' || phase === 'aiming' || phase === 'windup') && dribbleTime === null
  const characterIndex = phase === 'moving' || phase === 'windup' || phase === 'release' || phase === 'watch'
    ? animationFrame : dribbleTime === null ? 0 : shotTicks.length - 1
  const breathing = started && dribbleTime === null && (phase === 'ready' || phase === 'aiming'
    || (phase === 'watch' && characterIndex === shotTicks.length - 1))

  return <main className={ui('hoops-page')} style={viewport ? {
    ...viewport,
    '--hoops-vw': `${viewport.width / 100}px`,
    '--hoops-vh': `${viewport.height / 100}px`,
  } as CSSProperties : undefined}>
    <InkFilters />
    <a className={ui('brush-back hoops-back')} href="/" aria-label="Back to When Sunday Comes Around">
      <svg className={ui('ink-wiggle')} viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M29 18c-5 1-14 0-22 0m0 0 8-8m-8 8 8 8" /></svg>
    </a>
    <h1 className="sr-only">After-School Hoops</h1>
    <dialog ref={tutorial} className={ui('hoops-panel hoops-tutorial')} aria-labelledby="hoops-tutorial-title"
      onCancel={event => { if (!started) event.preventDefault() }} onClose={() => setStarted(true)}>
      <h1 id="hoops-tutorial-title" className={ui('ink-wiggle hoops-panel-title')}>How to play</h1>
      <ol className={ui('hoops-tutorial-steps')}>
        {tutorialSteps.map(({ label, art }) => <li key={label} className={ui('hoops-tutorial-step')}>
          {art ? <img src={art} alt="" width="84" height="84" />
            : <span className={ui('hoops-tutorial-player')}><BasketballPlayer walking={false} frame={2} started={false} /></span>}
          <p className={ui('hoops-panel-copy')}>{label}</p>
        </li>)}
      </ol>
      <form method="dialog" className={ui('hoops-panel-actions')}>
        <button type="submit" className={ui('cta')} autoFocus>Let’s play</button>
      </form>
    </dialog>
    <div className={ui('hoops-challenge')}>
      <BasketballProgress baskets={Math.min(basketGoal, basketsShown)} goal={basketGoal} idle={canShoot} />
      <button ref={court} type="button" className={ui('hoops-stage')} aria-label="Aim and shoot the basketball"
        aria-describedby="hoops-hint" aria-disabled={!canShoot || !forwardAim} tabIndex={complete ? -1 : 0} data-phase={phase}
        onPointerMove={event => {
          if (!canShoot) return
          setPhase('aiming')
          setAim(pointerAim(event))
        }}
        onPointerLeave={() => { if (phase === 'aiming') setPhase('ready') }}
        onPointerDown={event => {
          if (!canShoot || !event.isPrimary || event.button !== 0) return
          setPhase('aiming')
          const point = pointerAim(event)
          const bounds = event.currentTarget.getBoundingClientRect()
          const radius = Math.max(ballRadius, 16 * courtSize.width / bounds.width)
          ballPointer.current = Math.hypot(point.x - ball.x, point.y - ball.y) <= radius ? event.pointerId : null
          setAim(point)
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerUp={event => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
          event.currentTarget.releasePointerCapture(event.pointerId)
          if (!canShoot) return
          if (ballPointer.current === event.pointerId) {
            ballPointer.current = null
            dribble()
            return
          }
          const target = pointerAim(event)
          setAim(target)
          void shoot(target)
        }}
        onLostPointerCapture={() => { if (!busy.current) setPhase('ready') }}
        onClick={event => { if (canShoot && event.detail === 0) void shoot(aim) }}
        onKeyDown={event => {
          if (event.key.toLowerCase() === 'd' && !event.repeat) { dribble(); return }
          const offsets: Record<string, Point> = { ArrowLeft: { x: -10, y: 0 }, ArrowRight: { x: 10, y: 0 }, ArrowUp: { x: 0, y: -10 }, ArrowDown: { x: 0, y: 10 } }
          const offset = offsets[event.key]
          if (!offset) return
          event.preventDefault()
          if (canShoot) {
            setPhase('aiming')
            setAim(current => aimFromPointer(current.x + offset.x, current.y + offset.y))
          }
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
        <span className={ui('hoops-player')} style={{
          ...position(drawX + playerSpriteXOffset, playerPosition.y + playerSpriteYOffset, playerSpriteWidth),
          scale: phase === 'moving' && walkingRight ? '-1 1' : undefined,
          transformOrigin: '50% 100%',
        }} data-pose={phase} data-breathing={breathing}>
          <BasketballPlayer walking={phase === 'moving'} frame={characterIndex} started={started} />
        </span>
        {(flight || dribbleTime !== null) && <span className={ui('hoops-shadow')} style={{ ...position(ball.x, floorY + 35, 82), opacity: .08 + .14 * Math.max(0, 1 - (floorY - ball.y) / 500) }} aria-hidden="true" />}
        {!holding && phase !== 'moving' && <span className={ui('hoops-sprite hoops-ball')} data-ball style={{ ...position(ball.x, ball.y, 84),
          zIndex: flight?.inNet ? 3 : 6,
        }}><img src={ballArt} alt="" className="block size-full" style={{ rotate: (flight?.rotation ?? bounce * 60) + 'deg' }} draggable={false} /></span>}
        <BasketballNet frame={netFrame} front />
        {madeBasket && <span className={ui('hoops-swish')} style={position((rim.left + rim.right) / 2, rim.y, 250)} aria-hidden="true">
          <img src={swishArt} alt="" draggable={false} />
          <span>Basket!</span>
        </span>}
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
          <span className={ui('hoops-dot hoops-aim-ring')} data-invalid={!forwardAim} style={aimPosition} aria-hidden="true">
            {!forwardAim && <svg className={ui('hoops-aim-block')} viewBox="0 0 20 20" fill="none">
              <path d="M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>}
          </span>
        </>}
        {characterLoad && <span className={ui('hoops-hint')} role="status">
          {characterLoad === 'loading' ? 'Getting your shot ready…' : 'Tap or click to retry loading the character'}
        </span>}
        {!characterLoad && !round.shots && canShoot && <span className={ui('hoops-hint')} aria-hidden="true">Aim high, then tap or click</span>}
      </button>
      {complete && <div className={ui('hoops-result')}>
        <div className={ui('hoops-panel hoops-result-card')} aria-labelledby="hoops-complete-title">
          <h2 id="hoops-complete-title" className={ui('ink-wiggle hoops-panel-title')}>Challenge complete!</h2>
          <p className={ui('hoops-panel-copy')}>You made all ten baskets!</p>
          <div className={ui('hoops-panel-actions')}>
            <button type="button" ref={replay} className={ui('cta')} onClick={restart}>Play again</button>
          </div>
        </div>
      </div>}
    </div>
    <p id="hoops-hint" className="sr-only">Tap the ball or press D to dribble. Aim the circle above the basket, then click or tap to shoot. A red aim circle means that direction is blocked. Use the arrow keys to aim and Enter or Space to shoot.</p>
    <p className="sr-only" role="status">{message}</p>
  </main>
}

createRoot(document.getElementById('root')!).render(
  <ActivityEntry assets={openingArt} label="Getting the court ready…" errorMessage="The court couldn’t load.">
    <Basketball />
  </ActivityEntry>,
)
