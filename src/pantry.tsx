import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import paper from '../assets/pantry/tray-paper.webp'
import sign from '../assets/pantry/tray-sign.webp'
import { createRoot } from 'react-dom/client'
import { ui } from './ui-classes'
import kitchen from '../assets/pantry/kitchen.webp'
import portraitKitchen from '../assets/pantry/kitchen-portrait.webp'
import goodMark from '../assets/pantry/right-mark.webp'
import retryMark from '../assets/pantry/retry-mark.webp'
import goTray from '../assets/pantry/tray-go.webp'
import growTray from '../assets/pantry/tray-grow.webp'
import glowTray from '../assets/pantry/tray-glow.webp'
import junkTray from '../assets/pantry/tray-junk.webp'
import correctSound from '../assets/pantry/tray-right.wav'
import retrySound from '../assets/pantry/tray-retry.wav'
import completeSound from '../assets/pantry/lunch-packed.wav'

gsap.registerPlugin(useGSAP)

const sounds = {
  correct: new Audio(correctSound),
  retry: new Audio(retrySound),
  complete: new Audio(completeSound),
}

const art = import.meta.glob<string>('../assets/pantry/{rice,pandesal,eggs,fish,carrot,apple,candy,chips}.webp', { eager: true, query: '?url', import: 'default' })
const groups = [
  { name: 'Go', clue: 'Energy for play', image: goTray },
  { name: 'Grow', clue: 'Builds muscles', image: growTray },
  { name: 'Glow', clue: 'Fruits & veggies', image: glowTray },
  { name: 'Junk food', clue: 'Sometimes snacks', image: junkTray },
]
const foods = [
  ['rice','Rice','Go','Rice is rich in starch. Your body uses it for energy when you run, play, or think.','Think of the fuel you need to run across the playground. Which tray is for foods that supply that fuel?'],
  ['pandesal','Pandesal','Go','These little bread rolls give you energy for a busy morning at school.','Bread and rice both contain starch. What does your body use starch for when you play?'],
  ['eggs','Eggs','Grow','Inside the shell is protein that helps your body build and repair muscles.','Your muscles use protein like building blocks. Which tray would you choose for those blocks?'],
  ['fish','Fish','Grow','Fish gives your body protein to build and repair muscles. Some kinds also contain healthy fats.','After you climb or swim, your muscles use protein to repair themselves. Which tray fits that job?'],
  ['carrot','Carrots','Glow','Carrots give you fiber and a nutrient your body turns into vitamin A. It helps your eyes see in dim light.','Think about what carrots do for your eyes. Which tray is for foods that help different parts of your body work well?'],
  ['apple','Apples','Glow','Apples contain water and fiber. Fiber helps food move through your tummy.','This fruit has fiber that helps your tummy work well. Which other foods on the table do a similar job?'],
  ['candy','Candy','Junk food','Candy tastes sweet because it contains sugar. It gives you quick energy but little protein or fiber.','Candy has lots of sugar and very little else. Would you plan a meal around this food or save it for a treat?'],
  ['chips','Chips','Junk food','These crunchy snacks are often salty. A handful can be tasty, but chips alone don’t make a balanced lunch.','Think about when you eat a salty handful of crisps. Is it a main part of a meal or an occasional extra?'],
].map(([id,name,group,clue,tip]) => ({id,name,group,clue,tip,image:art[`../assets/pantry/${id}.webp`]}))
type Food = typeof foods[number]
function shuffle() {
  const items = [...foods]
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}
const instructions = 'Drag the food into its tray, or tap the food and then the tray.'
function Pantry() {
  const [order, setOrder] = useState(shuffle)
  const [sorted, setSorted] = useState<string[]>([])
  const [selected, select] = useState<Food | null>(null)
  const [message, say] = useState(instructions)
  const [feedback, setFeedback] = useState<{group:string; correct:boolean; serial:number} | null>(null)
  const stageRoot = useRef<HTMLElement>(null)
  const shake = useRef<Animation | null>(null)
  const lastCue = useRef<HTMLAudioElement | null>(null)
  function playCue(name: keyof typeof sounds) {
    lastCue.current?.pause()
    const sound = sounds[name]
    lastCue.current = sound
    sound.currentTime = 0
    sound.volume = .55
    void sound.play().catch(() => {})
  }

  function reactToDrop(group:string,correct:boolean) {
    setFeedback(last=>({group,correct,serial:(last?.serial ?? 0)+1}))
    shake.current?.cancel()
    if(!correct && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shake.current=stageRoot.current?.animate(
        [0,-4,3,-2,1,0].map(x=>({transform:`translateX(${x}px)`})),
        {duration:245,easing:'ease-out'}
      ) ?? null
    }
  }
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null)
  const skipClick = useRef(false)
  const servingArt = useRef<HTMLImageElement>(null)
  const packedArt = useRef<HTMLImageElement>(null)
  const placementStart = useRef<DOMRect | undefined>(undefined)
  const [success, setSuccess] = useState<Food | null>(null)
  useLayoutEffect(() => {
    const start = placementStart.current
    const image = packedArt.current
    placementStart.current = undefined
    if (!success || !start || !image || matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const end = image.getBoundingClientRect()
    const x = start.left + (start.width - end.width) / 2 - end.left
    const y = start.top + (start.height - end.height) / 2 - end.top
    const animation = image.animate([
      { transform: `translate(${x}px,${y}px) scale(${start.width / end.width})` },
      { transform: `translate(${x * .2}px,${Math.min(-12, y * .12 - 24)}px) scale(1.1)`, offset: .76 },
      { transform: 'none' },
    ], { duration: 470, easing: 'ease-out' })
    return () => animation.cancel()
  }, [success])
  function nextServing() {
    if (sorted.length === order.length) {
      setSorted([]); setOrder(shuffle())
    }
    select(null); setFeedback(null); setSuccess(null); say(instructions)
    skipClick.current=false
    requestAnimationFrame(()=>stageRoot.current?.querySelector<HTMLButtonElement>('.pantry-food')?.focus({preventScroll:true}))
  }
  const serving = !success && order.find(food => !sorted.includes(food.id))
  useGSAP(() => {
    if (!serving || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from('[data-bundle-entry]', { y: 70, duration: .52, ease: 'power3.out', clearProps:'transform' })
    gsap.from('[data-clue-card]', { xPercent: 65, opacity: 0, duration: .48, ease: 'power2.out', clearProps:'transform,opacity' })
  }, { scope:stageRoot, dependencies:[serving], revertOnUpdate:true })
  const done = sorted.length === order.length
  function place(food: Food, group: string, start = servingArt.current?.getBoundingClientRect()) {
    if (success) return
    reactToDrop(group,food.group === group)
    if (food.group !== group) {
      playCue('retry')
      const clue = groups.find(g => g.name === food.group)!.clue
      say(`Try again with ${food.name.toLowerCase()}. Look for “${clue}”.`)
      select(food)
      return
    }
    playCue(sorted.length === order.length - 1 ? 'complete' : 'correct')
    placementStart.current = start
    setSorted(ids => ids.includes(food.id) ? ids : [...ids, food.id])
    select(null)
    setSuccess(food)
  }
  function target(x: number, y: number) {
    return document.elementsFromPoint(x, y).map(el => el.closest<HTMLElement>('[data-basket]')?.dataset.basket).find(Boolean) || ''
  }
  function resetDrag(el: HTMLButtonElement) {
    drag.current = null
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
  return <main ref={stageRoot} className="fixed inset-0 isolate flex h-dvh flex-col overflow-x-hidden overflow-y-auto bg-[#ddba91] font-[Schoolbell,cursive] text-[#473623]">
    <picture className="pointer-events-none absolute inset-0 -z-20">
      <source media="(orientation: portrait)" srcSet={portraitKitchen}/>
      <img src={kitchen} alt="" className="size-full object-cover"/>
    </picture>
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-[clamp(6px,2vh,20px)] sm:px-8">
      <a href="/" className={ui('pantry-tag')}>← Home</a>
      <h1 className="sr-only">Pantry Pals</h1>
      <span className={ui('pantry-tag')}>{sorted.length} / {foods.length}</span>
    </header>
    <div className="mx-auto flex w-[96%] max-w-[1560px] flex-col gap-[3dvh] px-2 pb-[4dvh] pt-[4dvh] sm:w-[90%] sm:pt-[14dvh]">
      <section aria-label="Sorting trays" className="grid grid-cols-2 items-end justify-items-center gap-x-3 gap-y-1 sm:grid-cols-4">
        {groups.map((g,index) => <button key={g.name} data-basket={g.name} aria-label={`${g.name} tray. ${g.clue}`}
          className="relative grid w-full place-items-center rounded-2xl focus-visible:outline-3 focus-visible:outline-[#495c40]"
          onClick={() => selected ? place(selected,g.name) : say('Pick a food from the table first.')}>
          <span className="relative block w-full max-w-[min(100%,30dvh)] sm:max-w-[min(100%,43dvh)]">
            <img src={g.image} alt="" width={384} height={216} className="block h-auto w-full drop-shadow-[2px_5px_3px_#51321a59]" draggable={false}/>
            {foods.filter(food => food.group === g.name).map((food, slot) => sorted.includes(food.id) &&
              <img key={food.id} ref={success?.id === food.id ? packedArt : undefined} src={food.image} alt="" width={384} height={320}
                className={`pointer-events-none absolute bottom-[16%] w-[40%] drop-shadow-[1px_2px_1px_#51321a59] ${slot === 0 ? 'left-[12%]' : 'left-[49%]'}`} draggable={false}/>)}
            <img src={g.image} alt="" width={384} height={216} className="pointer-events-none absolute inset-0 h-full w-full [clip-path:inset(79%_0_0)]" draggable={false}/>
            {feedback?.group === g.name && <span key={feedback.serial} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10" onAnimationEnd={e => {
              if (e.target === e.currentTarget.lastElementChild) setFeedback(current=>current?.serial === feedback.serial ? null : current)
            }}>
              {(feedback.correct ? [-72,-40,-12,22,48,76] : [-35,0,35]).map((angle,i) => <i key={angle}
                className="pantry-particle" style={{'--dx':Math.sin(angle*Math.PI/180)*(45+i%2*18)+'px','--dy':(-28-Math.cos(angle*Math.PI/180)*40)+'px','--turn':angle+'deg',
                  backgroundImage:`url(${feedback.correct ? goodMark : retryMark})` } as React.CSSProperties}/>)}
            </span>}
          </span>
          <span className="pointer-events-none relative z-10 -mt-[min(1dvh,8px)] grid aspect-[440/184] w-[clamp(82px,11vw,158px)] place-items-center bg-contain bg-center bg-no-repeat pb-[2%] pl-1 text-[clamp(16px,3vmin,30px)] leading-none whitespace-nowrap drop-shadow-[2px_3px_1px_#50351d55]" style={{backgroundImage:`url(${sign})`,transform:`rotate(${[-3,2,-2,3][index]}deg)`}}>{g.name}</span>
        </button>)}
      </section>
      <section aria-label="Food on the table" className="grid w-full items-center justify-items-center gap-4 sm:grid-cols-[1fr_1.1fr_1fr] sm:gap-1">
        {[serving].map(food => <div data-bundle-entry key={food ? food.id : 'empty'} className="sm:col-start-2 flex min-h-[min(12dvh,16vw)] items-center justify-center">
          {food && <button key={food.id} aria-label={food.name} aria-describedby="food-clue" aria-pressed={selected?.id === food.id} className={ui('pantry-food')}
            onClick={e => {
              if (e.detail && skipClick.current) { skipClick.current = false; return }
              select(food)
            }}
            onPointerDown={e => {
              if (e.button !== 0 || !e.isPrimary) return
              e.preventDefault()
              e.currentTarget.focus({ preventScroll: true })
              skipClick.current = false
              drag.current = { id:e.pointerId, x:e.clientX, y:e.clientY, moved:false }
              e.currentTarget.setPointerCapture(e.pointerId)
            }} onPointerMove={move} onLostPointerCapture={e => { if (drag.current?.id === e.pointerId) resetDrag(e.currentTarget) }}
            onPointerUp={e => {
              if (drag.current?.id !== e.pointerId) return
              const moved = drag.current.moved
              const group = moved && target(e.clientX,e.clientY)
              const start = moved ? servingArt.current?.getBoundingClientRect() : undefined
              resetDrag(e.currentTarget)
              if (moved) { skipClick.current = true; if (group) place(food,group,start) }
            }}>
            <span className="pointer-events-none flex h-[min(22dvh,34vw)] w-[min(62vw,45dvh)] items-center justify-center">
              <img ref={servingArt} draggable={false} alt="" src={food.image} width={384} height={320} className="h-full w-auto max-w-full object-contain drop-shadow-[3px_7px_3px_#51321a66]"/>
            </span>
          </button>}
        </div>)}
        {serving && <aside key={serving.id} data-clue-card style={{backgroundImage:`url(${paper})`}} aria-labelledby="food-name" className="w-full max-w-[46ch] justify-self-end rounded-[5px_12px_7px_4px] border border-[#a8875e] bg-[#fff3d9] bg-[length:100%_100%] px-[clamp(12px,2vw,26px)] py-[clamp(6px,1.4vh,16px)] text-[clamp(17px,2.55vmin,28px)] leading-tight shadow-[2px_4px_0_#71513655]">
          <h2 id="food-name" className="mb-1 border-b border-[#d8bc92] pb-1 text-[1.4em]">{serving.name}</h2>
          <div id="food-clue"><p>{serving.clue}</p><p className="mt-1.5"><strong>Tip</strong> · {serving.tip}</p></div>
        </aside>}
      </section>
      <p role="status" className="sr-only">{message}</p>
    </div>
    {success && <aside aria-labelledby="packed-title" className="absolute bottom-3 right-3 z-20 w-[min(84vw,310px)] rounded-xl border border-[#806747] bg-[#fff5e3] px-4 py-2 text-[#533e2b] shadow-md sm:bottom-5 sm:right-5">
        <div className="relative float-right w-14">
          {[-65,-30,8,45,75].map((a,i)=><i key={a} aria-hidden="true" className="pantry-particle" style={{
            '--dx':Math.sin(a*Math.PI/180)*68+'px','--dy':(-16-Math.cos(a*Math.PI/180)*48)+'px','--turn':a+'deg',
            animationDelay:i*35+'ms',backgroundImage:`url(${goodMark})`
          } as React.CSSProperties}/>)}
        </div>
        <h2 role="status" id="packed-title" className="text-3xl">{done ? 'Lunch is packed!' : 'Right tray!'}</h2>
        <p className="mt-1 text-lg">{done ? 'All eight bundles are sorted.' : `Sorted into the ${success.group} tray.`}</p>
        <button autoFocus onClick={nextServing} className="mt-4 rounded-xl border-2 border-[#654632] bg-[#785334] px-6 py-1.5 text-xl text-[#fff6e2] shadow-[0_3px_0_#503b2c] active:translate-y-0.5">{done ? 'Play again' : 'Next bundle'}</button>
        {done && <a href="/" className="ml-4 underline">Home</a>}
    </aside>}
  </main>
}
createRoot(document.getElementById('root')!).render(<Pantry />)
