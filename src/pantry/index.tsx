import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { ActivityEntry } from '../activity-loading'
import { ActivityBackLink } from '../activity-back-link'
import { InkFilters } from '../ink-filters'
import { loadImage } from '../image-loading'
import { ui } from '../ui-classes'
import { groups, makeOrder, type Food } from './foods'
import goodMark from '../../assets/pantry/scene/right-mark.webp'
import tray from '../../assets/pantry/scene/tray.webp'
import tablecloth from '../../assets/pantry/scene/tablecloth.webp'
import compactTablecloth from '../../assets/pantry/scene/tablecloth-compact.webp'
import notePaper from '../../assets/pantry/scene/note-paper.webp'
import correctSound from '../../assets/pantry/audio/tray-right.mp3'
import retrySound from '../../assets/pantry/audio/tray-retry.mp3'
import completeSound from '../../assets/pantry/audio/lunch-packed.mp3'

const cueSources = {
  correct: correctSound,
  retry: retrySound,
  complete: completeSound,
}

const particles = [-72, -40, -12, 22, 48, 76].map((angle, index) => {
  const radians = angle * Math.PI / 180
  return {
    angle,
    style: {
      '--dx': `${Math.sin(radians) * (45 + index % 2 * 18)}px`,
      '--dy': `${-28 - Math.cos(radians) * 40}px`,
      '--turn': `${angle}deg`,
      '--pantry-particle-art': `url(${goodMark})`,
    } as CSSProperties,
  }
})
const initialOrder = makeOrder()
const compactClothMedia = '(max-width: 760px)'
const openingCloth = matchMedia(compactClothMedia).matches ? compactTablecloth : tablecloth
const openingArt = [openingCloth, notePaper, tray, goodMark, initialOrder[0].image]
function Pantry() {
  const [order, setOrder] = useState(initialOrder)
  const [nextLoad, setNextLoad] = useState<'loading' | 'error' | null>(null)
  const loadingNext = useRef(false)
  const [sortedCount, setSortedCount] = useState(0)
  const [selected, select] = useState<Food | null>(null)
  const [needsFood, setNeedsFood] = useState(false)
  const [feedback, setFeedback] = useState<{group:string; correct:boolean; serial:number} | null>(null)
  const stageRoot = useRef<HTMLElement>(null)
  const cues = useRef<Partial<Record<keyof typeof cueSources, HTMLAudioElement>>>({})
  const lastCue = useRef<HTMLAudioElement | null>(null)
  function playCue(name: keyof typeof cueSources) {
    lastCue.current?.pause()
    const sound = cues.current[name] ??= new Audio(cueSources[name])
    lastCue.current = sound
    sound.currentTime = 0
    sound.volume = .55
    void sound.play().catch(() => {})
  }

  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null)
  const skipClick = useRef(false)
  const servingArt = useRef<HTMLImageElement>(null)
  const packedArt = useRef<HTMLImageElement>(null)
  const placementStart = useRef<DOMRect | undefined>(undefined)
  const keyboardPlacement = useRef(false)
  const [success, setSuccess] = useState<Food | null>(null)
  useEffect(() => () => lastCue.current?.pause(), [])
  useLayoutEffect(() => {
    const start = placementStart.current
    const image = packedArt.current
    placementStart.current = undefined
    if (!start || !image || matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const end = image.getBoundingClientRect()
    const x = start.left + (start.width - end.width) / 2 - end.left
    const y = start.top + (start.height - end.height) / 2 - end.top
    const animation = image.animate([
      { transform: `translate(${x}px,${y}px) scale(${start.width / end.width})` },
      { transform: `translate(${x * .2}px,${Math.min(-12, y * .12 - 24)}px) scale(1.1)`, offset: .65 },
      { transform: 'scale(.96)', offset: .87 },
      { transform: 'none' },
    ], { duration: 440, easing: 'ease-out' })
    return () => animation.cancel()
  }, [sortedCount])
  const done = sortedCount === order.length
  const nextFood = order[sortedCount]
  const serving = success ? undefined : nextFood
  const noteFood = done ? undefined : serving ?? success
  const packed = order.slice(0, sortedCount)
  const matchedGroup = feedback?.correct ? feedback.group : undefined
  const waitingForFood = !done && nextLoad === 'loading'
  const nextServing = useCallback(async (keyboard: boolean) => {
    if (loadingNext.current) return
    const nextOrder = done ? makeOrder() : order
    const foodToLoad = nextOrder[done ? 0 : sortedCount]
    loadingNext.current = true
    keyboardPlacement.current = keyboard
    setNextLoad('loading')
    try {
      await loadImage(foodToLoad.image)
      if (done) {
        setSortedCount(0)
        setOrder(nextOrder)
        setFeedback(null)
      }
      select(null); setSuccess(null); setNeedsFood(false)
      skipClick.current = false
      setNextLoad(null)
      if (keyboard) requestAnimationFrame(() => stageRoot.current?.querySelector<HTMLButtonElement>('.pantry-food')?.focus())
    } catch {
      setNextLoad('error')
    } finally {
      loadingNext.current = false
    }
  }, [done, order, sortedCount])
  useEffect(() => {
    if (success && nextFood) void nextServing(keyboardPlacement.current)
  }, [nextFood, nextServing, success])
  useLayoutEffect(() => {
    if (!serving || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const animation = stageRoot.current?.querySelector('[data-bundle-entry]')?.animate(
      [{ transform: 'translateY(20px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' },
    )
    return () => animation?.cancel()
  }, [serving])
  function place(food: Food, group: string, start = servingArt.current?.getBoundingClientRect(), keyboard = false) {
    if (success) return
    const correct = food.group === group
    setNeedsFood(false)
    setFeedback(last => ({ group, correct, serial: (last?.serial ?? 0) + 1 }))
    if (!correct) {
      playCue('retry')
      select(food)
      return
    }
    const finalMatch = sortedCount === order.length - 1
    playCue(finalMatch ? 'complete' : 'correct')
    placementStart.current = start
    keyboardPlacement.current = keyboard
    setSortedCount(sortedCount + 1)
    select(null)
    setSuccess(food)
  }
  function prepareUpcomingFood() {
    const upcoming = order[sortedCount + 1]
    if (upcoming) void loadImage(upcoming.image).catch(() => {})
  }
  function target(x: number, y: number) {
    return document.elementsFromPoint(x, y).map(el => el.closest<HTMLElement>('[data-basket]')?.dataset.basket).find(Boolean) || ''
  }
  function resetDrag(el: HTMLButtonElement) {
    drag.current = null
    delete el.dataset.grabbed
    el.style.removeProperty('transform')
    el.style.removeProperty('z-index')
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    const d = drag.current
    if (!d || d.id !== event.pointerId) return
    const dx = event.clientX - d.x, dy = event.clientY - d.y
    if (!d.moved && Math.hypot(dx,dy) < 5) return
    d.moved = true
    event.currentTarget.style.transform = `translate(${dx}px,${dy}px) rotate(-4deg)`
    event.currentTarget.style.zIndex = '10'
  }
  return <main className={ui('pantry-page activity-type')}>
    <InkFilters />
    <ActivityBackLink />
    <h1 className={ui('pantry-game-title')}>Go, Grow, Glow!</h1>
    <div className={ui('pantry-layout')}>
      <div className={ui('pantry-frame')}>
        <section ref={stageRoot} className={ui('pantry-stage')} aria-label="Food matching game">
          <picture className={ui('pantry-tablecloth')}>
            <source media={compactClothMedia} srcSet={compactTablecloth}/>
            <img src={tablecloth} alt="" width={1536} height={1024} className="block size-full object-fill" draggable={false}/>
          </picture>
          <section aria-label="Food on the table" aria-hidden={!serving} className={ui('pantry-serving')}>
            {serving && <div data-bundle-entry key={serving.id}>
              <button aria-label={serving.name} aria-describedby="food-clue" aria-pressed={selected?.id === serving.id} className={ui('pantry-food')}
                onClick={e => {
                  if (e.detail && skipClick.current) { skipClick.current = false; return }
                  if (e.detail === 0) prepareUpcomingFood()
                  setNeedsFood(false)
                  select(serving)
                }}
                onPointerDown={e => {
                  if (e.button !== 0 || !e.isPrimary) return
                  prepareUpcomingFood()
                  e.preventDefault()
                  e.currentTarget.focus({ preventScroll: true })
                  skipClick.current = false
                  drag.current = { id:e.pointerId, x:e.clientX, y:e.clientY, moved:false }
                  e.currentTarget.dataset.grabbed = ''
                  e.currentTarget.setPointerCapture(e.pointerId)
                }} onPointerMove={move} onLostPointerCapture={e => { if (drag.current?.id === e.pointerId) resetDrag(e.currentTarget) }}
                onPointerUp={e => {
                  if (drag.current?.id !== e.pointerId) return
                  const moved = drag.current.moved
                  const group = moved && target(e.clientX,e.clientY)
                  const start = moved ? servingArt.current?.getBoundingClientRect() : undefined
                  resetDrag(e.currentTarget)
                  if (moved) { skipClick.current = true; if (group) place(serving,group,start) }
                }}>
                <span className={ui('pantry-food-size')} data-food={serving.id}>
                  <img ref={servingArt} draggable={false} alt="" src={serving.image} width={384} height={320} className={ui('pantry-food-art')}/>
                </span>
              </button>
            </div>}
          </section>
          <section aria-label="Food trays" className={ui('pantry-trays')}>
            {groups.map(g => {
              const placed = packed.filter(food => food.group === g.name)
              return <button key={g.name} data-basket={g.name} aria-label={`${g.name} tray. ${g.clue}`} disabled={Boolean(success)}
                data-placing={matchedGroup === g.name || undefined} className={ui('pantry-tray')}
                onClick={e => selected ? place(selected,g.name,undefined,e.detail === 0) : setNeedsFood(true)}>
                <span className={ui('pantry-tray-sprite')}>
                  <img src={tray} alt="" width={384} height={216} className={ui('pantry-tray-art')} draggable={false}/>
                  {placed.map((food, slot) => {
                    const justPlaced = matchedGroup === g.name && slot === placed.length - 1
                    return <span key={slot} data-slot={slot} className={ui('pantry-packed')}>
                      <img ref={justPlaced ? packedArt : undefined} src={food.image} alt="" width={384} height={320}
                        className={ui('pantry-packed-art')} draggable={false}/>
                      {justPlaced && feedback?.correct && <span aria-hidden="true" className="absolute inset-0 z-10" onAnimationEnd={e => {
                        if (e.target === e.currentTarget.lastElementChild) setFeedback(current => current?.serial === feedback.serial ? null : current)
                      }}>
                        {particles.map(({ angle, style }) => <i key={angle} className={ui('pantry-particle')} style={style}/>)}
                      </span>}
                    </span>
                  })}
                  <img src={tray} alt="" width={384} height={216} className={ui('pantry-tray-front')} draggable={false}/>
                  {feedback?.group === g.name && !feedback.correct && <b key={feedback.serial} className={ui('activity-tool-x pantry-tray-x')} aria-hidden="true">×</b>}
                </span>
                <span data-food-group={g.id} className={ui('pantry-tray-label pantry-group-color')}>{g.name}</span>
              </button>
            })}
          </section>
        </section>
      </div>
      <aside aria-labelledby="pantry-title" className={ui('pantry-panel')} style={{ '--pantry-note-paper': `url(${notePaper})` } as CSSProperties}>
        <header className={ui('pantry-note-heading')} data-complete={done || undefined}>
          <h2 id="pantry-title" className={ui('pantry-title ink-wiggle')}>{done ? 'Lunch is packed!' : noteFood?.name}</h2>
          <p className={ui('pantry-step')}>{done ? `${order.length} of ${order.length} matched` : `Food ${sortedCount + (serving ? 1 : 0)} of ${order.length}`}</p>
        </header>
        {noteFood && <p id="food-clue"><strong>Tip</strong> <span aria-hidden="true">·</span> {noteFood.tip}</p>}
        <div role="status" className={needsFood || waitingForFood || nextLoad === 'error' ? ui('pantry-feedback') : 'sr-only'}>
          {!done && matchedGroup && <span key={feedback?.serial} className="sr-only">Matched to {matchedGroup}.</span>}
          {done && <span className="sr-only">You filled all three trays.</span>}
          {feedback && !feedback.correct && <span key={feedback.serial} className="sr-only">Try a different tray.</span>}
          {needsFood && <p>Pick a food first.</p>}
          {waitingForFood && <p>Getting the next food…</p>}
          {nextLoad === 'error' && <p className={ui('activity-feedback')} data-wrong="true">The food didn’t load. Try again.</p>}
        </div>
        {sortedCount === 0 && <div className={ui('pantry-instruction')}>
          <h3 className="font-bold">How to play</h3>
          <p>Find the matching tray. Drag the food there, or tap the food and then the tray.</p>
        </div>}
        {success && (done || nextLoad === 'error') && <div className={ui('pantry-actions')}>
          <button autoFocus={keyboardPlacement.current} disabled={nextLoad === 'loading'} onClick={e => void nextServing(e.detail === 0)}
            className={ui('cta pantry-continue')}>{nextLoad === 'loading' ? 'Loading food…' : nextLoad === 'error' ? 'Try again' : 'Play again'}</button>
          {done && <a href="/" className={ui('pantry-home')}>Home</a>}
        </div>}
      </aside>
    </div>
  </main>
}
createRoot(document.getElementById('root')!).render(
  <ActivityEntry assets={openingArt} label="Setting the table…" errorMessage="The game art couldn’t load. Please try again.">
    <Pantry />
  </ActivityEntry>,
)
