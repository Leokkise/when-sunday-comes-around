import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { ActivityBackLink } from '../activity-back-link'
import { ActivityEntry } from '../activity-loading'
import { loadImages } from '../image-loading'
import { InkFilters } from '../ink-filters'
import { ui } from '../ui-classes'
import { carrotCuts, CarrotPieces } from './carrot-cuts'
import { CarrotSweep } from './carrot-sweep'
import { DicedCarrot, dicedCarrotArt } from './diced-carrot'
import { EggArt } from './egg-art'
import { recipe, recipeGroups, stepKey, storage, supplies, type CookingAction, type RecipeGroup, type Storage, type Supply } from './recipe'
import kitchenUpper from '../../assets/fried-rice/scene/kitchen-upper.webp'
import lowerCounter from '../../assets/fried-rice/scene/lower-counter.webp'
import table from '../../assets/fried-rice/scene/table.webp'
import cupboardDoor from '../../assets/fried-rice/scene/cupboard-door.webp'
import cupboardInterior from '../../assets/fried-rice/scene/cupboard-inside.webp'
import fridgeBody from '../../assets/fried-rice/scene/fridge-body.webp'
import fridgeDoor from '../../assets/fried-rice/scene/fridge-door.webp'
import fridgeInterior from '../../assets/fried-rice/scene/fridge-inside.webp'
import choppingCarrot from '../../assets/fried-rice/food/whole-carrot.webp'
import crackedEgg from '../../assets/fried-rice/food/cracked-egg.webp'
import scrambledEgg from '../../assets/fried-rice/food/scrambled-egg.webp'
import friedRice from '../../assets/fried-rice/food/fried-rice.webp'
import notePaper from '../../assets/pantry/scene/note-paper.webp'
import electricCooker from '../../assets/fried-rice/tools/electric-cooker.webp'

const areas = Object.keys(storage) as Storage[]
const openingArt = [kitchenUpper, lowerCounter, table, cupboardDoor, fridgeBody, fridgeDoor, notePaper, electricCooker]
const carrotPrepArt = [choppingCarrot, dicedCarrotArt.raw, supplies.plate.image]
const knifeLength = { min: 82, max: 269, cqw: 26.5 }
const bladeAnchor = 39
const handleAnchor = 65
const spatulaGrip = { x: 0.53, y: 0.49 }
const spatulaBlade = { x: 0.23, y: 0.76 }
const kitchenStyle = {
  '--fried-rice-wall': `url(${kitchenUpper})`,
  '--fried-rice-counter-art': `url(${lowerCounter})`,
  '--fried-rice-door': `url(${cupboardDoor})`,
  '--fried-rice-door-inside': `url(${cupboardInterior})`,
  '--fried-rice-fridge': `url(${fridgeDoor})`,
  '--fried-rice-fridge-inside': `url(${fridgeInterior})`,
  '--fried-rice-knife-length': `clamp(${knifeLength.min}px,${knifeLength.cqw}cqw,${knifeLength.max}px)`,
  '--fried-rice-knife-handle': `${handleAnchor}%`,
  '--fried-rice-spatula-grip': `${-spatulaGrip.x * 100}% ${-spatulaGrip.y * 100}%`,
} as CSSProperties
const guideStyle = { '--pantry-note-paper': `url(${notePaper})` } as CSSProperties
const cookingTargets = {
  chop: 'knife', oil: 'oil', carrots: 'carrots', soften: 'spatula', egg: 'eggs',
  scramble: 'spatula', rice: 'rice', mix: 'spatula', salt: 'salt', pepper: 'pepper', serve: 'plate',
} as const satisfies Record<Exclude<CookingAction, 'heat'>, Supply>
const shelfNames = ['Top shelf', 'Middle shelf', 'Bottom shelf'] as const
const shelfName = (row: number, shelfCount: number) => shelfNames[row === shelfCount - 1 ? 2 : row]
const backsplashPatches = Array.from({ length: 15 }, (_, index) => index)
const chopAnimationMs = 330
const carrotSlideMs = 480
const oilPourMs = 1200
const oilWarmMs = 1800
const eggCrackMs = 1050
const eggCrackStyle = { '--fried-rice-egg-crack-time': `${eggCrackMs}ms` } as CSSProperties
type HeldItem = { item: Supply; x: number; y: number }
type KnifeInput = 'pointer' | 'touch' | 'keyboard'
type KnifeAim = { x: number; y: number; input: KnifeInput; touchCut?: number; gripOffset?: { x: number; y: number } }
type Progress = { stepIndex: number; taps: number }

const progressKey = 'when-sunday-comes-around.fried-rice.v1'

function readProgress(): Progress {
  const fresh = { stepIndex: 0, taps: 0 }
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey) ?? 'null')
    if (saved?.step === 'finished') return { stepIndex: recipe.length, taps: 0 }
    // An intact egg returns to the fridge when a game is restored.
    const savedStep = saved?.step === 'cook:egg' ? 'get:eggs' : saved?.step
    const stepIndex = recipe.findIndex(step => stepKey(step) === savedStep)
    if (stepIndex < 0 || saved?.step === 'cook:oil') return fresh
    const step = recipe[stepIndex]
    const taps = 'taps' in step && Number.isInteger(saved.taps) && saved.taps >= 0 && saved.taps < step.taps ? saved.taps : 0
    return { stepIndex, taps }
  } catch {
    return fresh
  }
}

function saveProgress(stepIndex: number, taps: number) {
  try {
    if (stepIndex === 0) localStorage.removeItem(progressKey)
    else localStorage.setItem(progressKey, JSON.stringify({ step: stepKey(recipe[stepIndex]), taps }))
  } catch { /* Storage can be unavailable. */ }
}

function FriedRice({ checkpoint, practice, onProgress, onPractice, onReturn }: {
  checkpoint: Progress
  practice: RecipeGroup | null
  onProgress: (stepIndex: number, taps: number) => void
  onPractice: (group: RecipeGroup) => void
  onReturn: () => void
}) {
  const [stepIndex, setStepIndex] = useState(checkpoint.stepIndex)
  const [openStorage, setOpenStorage] = useState<Storage | null>(null)
  const [visitedStorage, setVisitedStorage] = useState<Partial<Record<Storage, true>>>({})
  const [taps, setTaps] = useState(checkpoint.taps)
  const [held, setHeld] = useState<HeldItem | null>(null)
  const [supplyArt, setSupplyArt] = useState<'loading' | 'error' | null>(null)
  const [pouringOil, setPouringOil] = useState(false)
  const [warmingOil, setWarmingOil] = useState(false)
  const [crackingEgg, setCrackingEgg] = useState(false)
  const [cutting, setCutting] = useState(false)
  const [knifeAim, setKnifeAim] = useState<KnifeAim | null>(null)
  const [mistake, setMistake] = useState<{ item: Supply; attempt: number } | null>(null)
  const page = useRef<HTMLElement>(null)
  const kitchen = useRef<HTMLElement>(null)
  const heldArt = useRef<HTMLElement>(null)
  const restingSpatula = useRef<HTMLImageElement>(null)
  const spatulaPanTarget = useRef<HTMLButtonElement>(null)
  const choppingArea = useRef<HTMLDivElement>(null)
  const chopTimer = useRef<number | undefined>(undefined)
  const pourTimer = useRef<number | undefined>(undefined)
  const warmTimer = useRef<number | undefined>(undefined)
  const eggTimer = useRef<number | undefined>(undefined)
  const runVersion = useRef(0)
  useEffect(() => () => {
    runVersion.current += 1
    window.clearTimeout(chopTimer.current)
    window.clearTimeout(pourTimer.current)
    window.clearTimeout(warmTimer.current)
    window.clearTimeout(eggTimer.current)
  }, [])
  const step = recipe[stepIndex]
  const practiceComplete = practice !== null && stepIndex === practice.end
  const gathering = !practiceComplete && step && 'item' in step ? step : null
  const cooking = !practiceComplete && step && 'action' in step ? step : null
  const complete = !step
  const holdingSpatula = held?.item === 'spatula'
  const holdingEgg = held?.item === 'eggs'
  const target = cooking && cooking.action !== 'heat' ? cookingTargets[cooking.action] : null
  const tapGoal = cooking && 'taps' in cooking ? cooking.taps : 1
  const slidingCarrot = cooking?.action === 'chop' && taps === carrotCuts.length
  const cut = carrotCuts[Math.min(taps, carrotCuts.length - 1)]
  const along = cut.axis === 'along'
  const cutX = along ? 50 : cut.position
  const cutY = along ? cut.position : 50
  const cutDirection = along ? 'along' : 'across'
  const bladePoint = (aim: KnifeAim) => ({
    x: aim.x - (along ? aim.gripOffset?.x ?? 0 : 0),
    y: aim.y - (along ? 0 : aim.gripOffset?.y ?? 0),
  })
  const isAligned = (aim: KnifeAim) => {
    const { x, y } = bladePoint(aim)
    return Math.abs(x - cutX) <= (along ? 46 : aim.input === 'touch' ? 20 : 10) &&
      Math.abs(y - cutY) <= (along ? aim.input === 'touch' ? 38 : 16 : 65) &&
      (aim.input !== 'touch' || aim.touchCut === taps)
  }
  const aligned = !!knifeAim && isAligned(knifeAim)
  let instruction = 'Rice for Go, egg for Grow, and carrot for Glow. Time to eat!'
  if (practiceComplete) {
    instruction = 'Try this group again or go back to your recipe.'
  } else if (pouringOil) {
    instruction = 'A little oil goes into the pan.'
  } else if (warmingOil) {
    instruction = 'Wait a moment for the oil to warm up.'
  } else if (crackingEgg) {
    instruction = 'The egg drops into the pan.'
  } else if (held) {
    instruction = held.item === 'oil' ? 'Tap the pan to pour a little oil.' :
      holdingEgg ? 'Tap the pan to crack the egg.' :
      holdingSpatula ? 'Tap the pan to start stirring.' :
      cooking?.action === 'carrots' ? 'Tap the pan to add the carrot.' :
      held.item === 'pan' ? 'Tap the shadow to put the pan on the cooker.' : 'Tap the shadow to put it down.'
  } else if (gathering) {
    const { label, shelves } = storage[gathering.area]
    const row = shelves.findIndex(items => items.some(item => item === gathering.item))
    const shelf = shelfName(row, shelves.length).toLowerCase()
    instruction = openStorage === gathering.area
      ? `Tap it on the ${shelf}.`
      : `Open the ${label.toLowerCase()} and look on the ${shelf}.`
  } else if (cooking && 'instruction' in cooking) {
    instruction = cooking.instruction
  } else if (target) {
    instruction = `Tap the ${supplies[target].label.toLowerCase()} ${tapGoal} times.`
  }
  if (slidingCarrot) {
    instruction = 'The diced carrot is ready for the pan.'
  } else if (knifeAim) {
    instruction = {
      pointer: `Cut ${cutDirection} the carrot. Line up the blade and click.`,
      touch: 'Tap the line to aim. Tap there again to cut.',
      keyboard: 'Use the arrow keys to line up the knife. Press Enter to cut.',
    }[knifeAim.input]
  }
  const completedSteps = recipe.slice(0, stepIndex)
  const gathered = (item: Supply) => completedSteps.some(previous => 'item' in previous && previous.item === item)
  const finished = (action: CookingAction) => completedSteps.some(previous => 'action' in previous && previous.action === action)
  function focusNext() {
    requestAnimationFrame(() => page.current?.querySelector<HTMLButtonElement>('[data-next=true]')?.focus())
  }

  function advance() {
    if (practiceComplete) return
    const next = stepIndex + 1
    if (!practice) onProgress(next, 0)
    setStepIndex(next)
    setTaps(0)
    setMistake(null)
  }

  function kitchenPosition(clientX: number, clientY: number, item?: Supply) {
    const bounds = kitchen.current!.getBoundingClientRect()
    const x = (clientX - bounds.left) / bounds.width * 100
    const y = (clientY - bounds.top) / bounds.height * 100
    if (item === 'knife' || item === 'spatula') return { x, y }
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(12, Math.min(100, y)),
    }
  }

  function moveHeld(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === 'touch' || !heldArt.current) return
    const { x, y } = kitchenPosition(event.clientX, event.clientY, held?.item)
    heldArt.current.style.setProperty('--fried-rice-held-x', `${x}%`)
    heldArt.current.style.setProperty('--fried-rice-held-y', `${y}%`)
  }

  async function pickUp(item: Supply, event: MouseEvent<HTMLButtonElement>) {
    if (!gathering || held || supplyArt === 'loading') return
    if (item !== gathering.item) {
      setMistake(previous => ({ item, attempt: (previous?.attempt ?? 0) + 1 }))
      return
    }
    const keyboard = event.detail === 0
    const bounds = event.currentTarget.getBoundingClientRect()
    const position = keyboard
      ? kitchenPosition(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, item)
      : kitchenPosition(event.clientX, event.clientY, item)
    const version = runVersion.current
    const pickupArt = item === 'carrots' ? carrotPrepArt : item === 'spatula' ? [dicedCarrotArt.softened] :
      item === 'eggs' ? [crackedEgg] : null
    if (pickupArt) {
      setSupplyArt('loading')
      try {
        await loadImages(pickupArt)
        if (version !== runVersion.current) return
        setSupplyArt(null)
      } catch {
        if (version !== runVersion.current) return
        setSupplyArt('error')
        if (keyboard) focusNext()
        return
      }
    }
    setHeld({ item, ...position })
    setMistake(null)
    if (item === 'spatula') setOpenStorage(null)
    if (item === 'oil' || item === 'eggs') {
      setOpenStorage(null)
      // Save once the held ingredient goes into the pan.
      setStepIndex(stepIndex + 1)
    }
    if (keyboard) focusNext()
  }

  function place(keyboard: boolean) {
    if (!gathering || held?.item !== gathering.item) return
    const next = recipe[stepIndex + 1]
    if (!next || !('area' in next) || next.area !== gathering.area) setOpenStorage(null)
    setHeld(null)
    advance()
    if (keyboard) focusNext()
  }

  function tapWithSpatula(event: MouseEvent<HTMLElement>) {
    if (event.detail === 0 || (event.target instanceof Element && event.target.closest('button'))) return
    const pan = spatulaPanTarget.current?.getBoundingClientRect()
    const tool = heldArt.current?.getBoundingClientRect()
    if (!pan || !tool) return

    const bladeX = event.clientX + (spatulaBlade.x - spatulaGrip.x) * tool.width
    const bladeY = event.clientY + (spatulaBlade.y - spatulaGrip.y) * tool.height
    const x = (bladeX - (pan.left + pan.width / 2)) / (pan.width / 2 + tool.width * 0.1)
    const y = (bladeY - (pan.top + pan.height / 2)) / (pan.height / 2 + tool.height * 0.1)
    if (x * x + y * y <= 1) place(false)
  }

  function placement(item: Supply, position: string) {
    if (held?.item !== item) return null
    return <button type="button" className={ui(`${position} fried-rice-placement`)} data-next="true"
      aria-label={`Place the ${supplies[item].label.toLowerCase()}`}
      onClick={event => void place(event.detail === 0)}>
      <img src={supplies[item].image} alt="" className={ui('fried-rice-placement-shadow')} />
    </button>
  }

  function cook(keyboard: boolean) {
    if (taps + 1 < tapGoal) {
      if (!practice) onProgress(stepIndex, taps + 1)
      setTaps(taps + 1)
      return
    }
    if (cooking?.action === 'chop') setKnifeAim(null)
    advance()
    if (keyboard) focusNext()
  }

  function pourOil(keyboard: boolean) {
    if (cooking?.action !== 'oil' || held?.item !== 'oil' || pourTimer.current !== undefined) return
    setHeld(null)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return cook(keyboard)
    setPouringOil(true)
    pourTimer.current = window.setTimeout(() => {
      pourTimer.current = undefined
      setPouringOil(false)
      cook(keyboard)
    }, oilPourMs)
  }

  function warmOil(keyboard: boolean) {
    if (warmTimer.current !== undefined) return
    setWarmingOil(true)
    warmTimer.current = window.setTimeout(() => {
      warmTimer.current = undefined
      setWarmingOil(false)
      cook(keyboard)
    }, oilWarmMs)
  }

  function crackEgg(keyboard: boolean) {
    if (cooking?.action !== 'egg' || !holdingEgg || eggTimer.current !== undefined) return
    setHeld(null)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return cook(keyboard)
    setCrackingEgg(true)
    eggTimer.current = window.setTimeout(() => {
      eggTimer.current = undefined
      setCrackingEgg(false)
      cook(keyboard)
    }, eggCrackMs)
  }

  function aimAt(event: MouseEvent<HTMLElement>, input: KnifeInput): KnifeAim {
    const bounds = choppingArea.current!.getBoundingClientRect()
    const aim = {
      input,
      x: 100 * (event.clientX - bounds.left) / bounds.width,
      y: 100 * (event.clientY - bounds.top) / bounds.height,
    }
    if (input !== 'pointer') return aim

    const length = Math.min(knifeLength.max, Math.max(knifeLength.min, kitchen.current!.clientWidth * knifeLength.cqw / 100))
    const offset = length * (handleAnchor - bladeAnchor) / 100
    return { ...aim, gripOffset: { x: 100 * offset / bounds.width, y: 100 * offset / bounds.height } }
  }

  function aimWithKeys(event: KeyboardEvent<HTMLButtonElement>) {
    const arrows: Record<string, [number, number]> = {
      ArrowLeft: [-6, 0], ArrowRight: [6, 0], ArrowUp: [0, -12], ArrowDown: [0, 12],
    }
    const direction = arrows[event.key]
    if (!direction || !knifeAim) return
    event.preventDefault()
    if (cutting) return
    const [dx, dy] = direction
    const { x, y } = bladePoint(knifeAim)
    setKnifeAim({
      input: 'keyboard',
      x: Math.max(0, Math.min(100, x + dx)),
      y: Math.max(-50, Math.min(150, y + dy)),
    })
  }

  function chop(event: MouseEvent<HTMLButtonElement>) {
    if (!knifeAim || chopTimer.current !== undefined) return
    const keyboard = event.detail === 0
    const aim = keyboard ? knifeAim : { ...aimAt(event, knifeAim.input === 'touch' ? 'touch' : 'pointer'), touchCut: taps }
    if (!isAligned(aim) || (aim.input === 'touch' && !aligned)) {
      setKnifeAim(aim)
      return
    }
    setKnifeAim(aim.input === 'pointer' ? aim : { ...aim, x: cutX, y: cutY })
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return cook(keyboard)
    setCutting(true)
    chopTimer.current = window.setTimeout(() => {
      setCutting(false)
      if (taps + 1 === tapGoal) {
        setTaps(tapGoal)
        chopTimer.current = window.setTimeout(() => {
          chopTimer.current = undefined
          cook(keyboard)
        }, carrotSlideMs)
        return
      }
      chopTimer.current = undefined
      cook(keyboard)
    }, chopAnimationMs)
  }

  function reset() {
    onProgress(0, 0)
    runVersion.current += 1
    window.clearTimeout(chopTimer.current)
    window.clearTimeout(pourTimer.current)
    window.clearTimeout(warmTimer.current)
    window.clearTimeout(eggTimer.current)
    chopTimer.current = undefined
    pourTimer.current = undefined
    warmTimer.current = undefined
    eggTimer.current = undefined
    setStepIndex(0)
    setOpenStorage(null)
    setVisitedStorage({})
    setHeld(null)
    setTaps(0)
    setMistake(null)
    setSupplyArt(null)
    setPouringOil(false)
    setWarmingOil(false)
    setCrackingEgg(false)
    setCutting(false)
    setKnifeAim(null)
  }

  const preparingCarrot = !finished('chop')
  const carrotSetAside = slidingCarrot || !preparingCarrot
  const cookerOnTable = gathered('pan') || held?.item === 'pan'
  const platesLeft = 3 - (carrotSetAside ? 1 : 0) - (gathered('plate') || held?.item === 'plate' ? 1 : 0)
  const canAddCarrot = cooking?.action === 'carrots'
  const holdingDicedCarrot = canAddCarrot && held?.item === 'carrots'
  const sweepingCarrot = cooking?.action === 'soften'
  const counterItem = complete ? 'plate' : preparingCarrot || canAddCarrot || sweepingCarrot || holdingSpatula || held?.item === 'pan' || cooking?.action === 'oil' || cooking?.action === 'egg' ? null : held?.item ?? target
  const keepSpatula = gathered('spatula') && !finished('mix') && target !== 'spatula'
  const heldStyle = held ? { '--fried-rice-held-x': `${held.x}%`, '--fried-rice-held-y': `${held.y}%` } as CSSProperties : undefined
  const previous = completedSteps.at(-1)
  const previousAction = previous && 'action' in previous ? previous.action : null
  const outgoing = previousAction === 'rice' ||
    previousAction === 'salt' || previousAction === 'pepper' || previousAction === 'mix'
    ? cookingTargets[previousAction] : null

  function counterSupply(item: Supply) {
    if (held?.item === item) return placement(item, 'fried-rice-work-item')
    const label = complete ? 'Plate of egg and carrot fried rice' : supplies[item].label
    const art = <>
      <img src={supplies[item].image} alt="" className={ui('size-full object-contain fried-rice-item-highlight')} />
      {complete && <img src={friedRice} alt="" className={ui('fried-rice-served')} />}
    </>
    return target === item
      ? <button type="button" className={ui(`fried-rice-work-item ${item === 'spatula' ? 'fried-rice-spatula-target' : 'fried-rice-target'} group/item`)} data-next="true"
        aria-label={step.title} onClick={event => cook(event.detail === 0)}>
        <span key={taps} className={ui('fried-rice-tool-art')} data-stirred={taps > 0 || undefined}>{art}</span>
        <span aria-hidden="true" className={ui('fried-rice-item-label')}>{label}</span>
      </button>
      : <span className={ui('fried-rice-work-item group/item')} role="img" aria-label={label}>
        {art}
        <span aria-hidden="true" className={ui('fried-rice-item-label')}>{complete ? 'Fried rice' : label}</span>
      </span>
  }

  return <main className={ui('activity-type pantry-page')} ref={page} onKeyDown={event => {
    if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault()
    if (event.key !== 'Escape' || chopTimer.current !== undefined || pourTimer.current !== undefined || (!held && !knifeAim) || supplyArt === 'loading') return
    event.preventDefault()
    setKnifeAim(null)
    if (held?.item === 'oil' || holdingEgg) setStepIndex(stepIndex - 1)
    setHeld(null)
    setSupplyArt(null)
    focusNext()
  }}>
    <InkFilters />
    <ActivityBackLink />
    <h1 className={ui('pantry-game-title fried-rice-title')}>Egg &amp; Carrot Fried Rice</h1>
    <div className={ui('pantry-layout')}>
      <div className={ui('pantry-frame')}>
        <section ref={kitchen} aria-label="Kitchen" className={ui('fried-rice-stage')} style={kitchenStyle} inert={practiceComplete}
          data-grabbing-tool={held?.item === 'knife' || holdingSpatula || holdingEgg || undefined}
          onClick={holdingSpatula ? tapWithSpatula : undefined}
          onPointerMove={held ? moveHeld : undefined}>
          <div className={ui('fried-rice-rear')}>
            <img src={kitchenUpper} className={ui('fried-rice-room-upper')} alt="" />
            <img src={lowerCounter} className={ui('fried-rice-room-counter')} alt="" />
            {!cookerOnTable && <img src={electricCooker} className={ui('fried-rice-parked-cooker')}
              alt="Portable electric cooker on the rear counter" />}
            <div className={ui('fried-rice-backsplash-extension')} aria-hidden="true">
              {backsplashPatches.map(patch => <span key={patch} className={ui('fried-rice-backsplash-tiles')} />)}
            </div>
            {areas.map(area => {
              const { label, shelves } = storage[area]
              const isOpen = openStorage === area
              const isNext = !held && gathering?.area === area
              return <div key={area} data-storage={area} className={ui('fried-rice-storage group/storage')} data-open={isOpen || undefined}>
                {area === 'fridge' && <img src={fridgeBody} alt="" className={ui('fried-rice-fridge-body')} />}
                <button type="button" className={ui('fried-rice-door peer/door')} aria-expanded={isOpen}
                  aria-label={isOpen ? `Close ${label.toLowerCase()}` : label}
                  aria-controls={`fried-rice-${area}-shelves`}
                  data-next={isNext && !isOpen || undefined}
                  onClick={event => {
                    setMistake(null)
                    if (!isOpen && !visitedStorage[area]) setVisitedStorage(current => ({ ...current, [area]: true }))
                    setOpenStorage(isOpen ? null : area)
                    if (event.detail === 0 && !isOpen && isNext) focusNext()
                  }} />
                <span aria-hidden="true" className={ui('fried-rice-door-swing')}>
                  <span className={ui('fried-rice-door-face fried-rice-door-front')} />
                  {visitedStorage[area] && <span className={ui('fried-rice-door-face fried-rice-door-inside')} />}
                </span>
                <div id={`fried-rice-${area}-shelves`} role="group" aria-label={`Inside ${label.toLowerCase()}`} inert={!isOpen} aria-hidden={!isOpen}
                  className={ui('fried-rice-shelf')}>
                  {visitedStorage[area] && shelves.map((items, row) => <div key={row} role="group"
                    aria-label={shelfName(row, shelves.length)} data-count={items.length}
                    className={ui(area === 'fridge' && row === shelves.length - 1 ? 'fried-rice-shelf-row fried-rice-fridge-floor' : 'fried-rice-shelf-row')}>
                    {items.map(item => <div key={item} className="relative min-h-0 min-w-0">
                      {item === 'eggs' && gathered(item) ? <EggArt variant="shelf-pair" className={ui('fried-rice-shelf-eggs')} /> :
                      (item === 'plate' ? platesLeft > 0 : !gathered(item) && held?.item !== item) && <button type="button" className={ui('fried-rice-supply group/item')} aria-label={supplies[item].label}
                        data-item={item} data-next={isOpen && isNext && gathering?.item === item || undefined}
                        onClick={event => void pickUp(item, event)} disabled={!gathering || !!held || gathered(item) || supplyArt === 'loading'}>
                        {Array.from({ length: item === 'plate' ? platesLeft : 1 }, (_, layer) => <img key={layer}
                          src={supplies[item].image} alt="" className={ui('fried-rice-supply-art fried-rice-item-highlight')}
                          style={item === 'plate' ? { '--fried-rice-plate-offset': `${(platesLeft - 1 - layer) * 9}%` } as CSSProperties : undefined} />)}
                        <span aria-hidden="true" className={ui('fried-rice-item-label')}>{supplies[item].label}</span>
                        {mistake?.item === item && <b key={mistake.attempt} className={ui('activity-tool-x fried-rice-wrong')} aria-hidden="true">×</b>}
                      </button>}
                    </div>)}
                  </div>)}
                </div>
              </div>
            })}
          </div>
          <img src={table} className={ui('fried-rice-table-art')} alt="" />
          <div className={ui('fried-rice-worktop')} data-served={complete || undefined} aria-label="Cooking counter">
            {(!finished('carrots') || previousAction === 'carrots') && <div className={ui('fried-rice-prep')} data-set-aside={carrotSetAside || undefined}
              style={{ '--fried-rice-slide-time': `${carrotSlideMs}ms` } as CSSProperties}>
              {preparingCarrot && (gathered('board') ? <span className={ui('fried-rice-prep-board fried-rice-board-contact group/item')}>
                <img src={supplies.board.image} alt="Cutting board" className="relative size-full object-contain" />
                <span aria-hidden="true" className={ui('fried-rice-item-label')}>Cutting board</span>
              </span> : placement('board', 'fried-rice-prep-board'))}
              {gathered('carrots') ? <div ref={choppingArea} className={ui('fried-rice-chop-scene')} data-cutting={cutting || undefined}
                data-aligned={aligned || undefined} data-along={along || undefined} style={{
                '--fried-rice-chop-art': `url(${choppingCarrot})`,
                '--fried-rice-cut-x': `${cutX}%`,
                '--fried-rice-cut-y': `${cutY}%`,
                '--fried-rice-cut-time': `${chopAnimationMs}ms`,
                '--fried-rice-knife-x': `${knifeAim?.x ?? 0}%`,
                '--fried-rice-knife-y': `${knifeAim?.y ?? 0}%`,
                '--fried-rice-knife-anchor': `${knifeAim?.input === 'pointer' ? handleAnchor : bladeAnchor}%`,
              } as CSSProperties}>
                {carrotSetAside && <div className={ui('fried-rice-carrot-dish fried-rice-carrot-set-aside group/dish')}>
                  <img src={supplies.plate.image} className={ui('fried-rice-carrot-plate')} alt="Carrot plate" />
                  {canAddCarrot && <button type="button" className={ui('fried-rice-add-carrot')}
                    data-next={!holdingDicedCarrot || undefined} aria-label={holdingDicedCarrot ? 'Put the carrot back' : 'Pick up the chopped carrot'}
                    onClick={event => {
                      const keyboard = event.detail === 0
                      const bounds = event.currentTarget.getBoundingClientRect()
                      setHeld(holdingDicedCarrot ? null : {
                        item: 'carrots',
                        ...kitchenPosition(keyboard ? bounds.left + bounds.width / 2 : event.clientX,
                          keyboard ? bounds.top + bounds.height / 2 : event.clientY),
                      })
                      if (keyboard) focusNext()
                    }} />}
                </div>}
                {!holdingDicedCarrot && previousAction !== 'carrots' && <div className={ui('absolute inset-0 fried-rice-carrot-set-aside')}>
                  <div className={ui('fried-rice-chop-carrot')} role={canAddCarrot ? undefined : 'img'}
                    aria-label={canAddCarrot ? undefined : carrotSetAside ? 'Diced carrot on a plate' : taps ? 'Partly cut carrot' : 'Carrot on the cutting board'}>
                    {carrotSetAside ? <DicedCarrot className="fried-rice-diced-carrot" /> : <>
                      <span className={ui('fried-rice-carrot-frame')} data-frame={cutting ? 'before' : undefined}>
                        <CarrotPieces taps={taps} />
                      </span>
                      {cutting && <span className={ui('fried-rice-carrot-frame')} data-frame="after">
                        <CarrotPieces taps={taps + 1} />
                      </span>}
                    </>}
                  </div>
                </div>}
                {!carrotSetAside && <span className={ui('fried-rice-cut-guide')} aria-hidden="true" />}
                {knifeAim && <img src={supplies.knife.image} className={ui('fried-rice-chop-knife')}
                  data-pointer-held={knifeAim.input === 'pointer' || undefined} alt="" />}
              </div> : placement('carrots', 'fried-rice-prep-carrot')}
              {cooking?.action === 'chop' && !knifeAim ? <button type="button"
                className={ui('fried-rice-prep-knife fried-rice-knife-pickup group/item')} data-next="true" aria-label="Pick up the knife"
                onClick={event => {
                  const input = event.detail === 0 ? 'keyboard' : 'pointerType' in event.nativeEvent && event.nativeEvent.pointerType === 'touch' ? 'touch' : 'pointer'
                  setKnifeAim(input === 'keyboard' ? { x: 50, y: 50, input } : aimAt(event, input))
                  if (input === 'keyboard') focusNext()
                }}>
                <img src={supplies.knife.image} alt="" />
                <span aria-hidden="true" className={ui('fried-rice-item-label')}>Knife</span>
              </button> : preparingCarrot && !knifeAim && (gathered('knife') ? <span className={ui('fried-rice-prep-knife group/item')}>
                <img src={supplies.knife.image} alt="Knife" />
                <span aria-hidden="true" className={ui('fried-rice-item-label')}>Knife</span>
              </span> : placement('knife', 'fried-rice-prep-knife'))}
            </div>}
            {!preparingCarrot && <div className={ui('fried-rice-pan group/item')}
              data-retiring={complete || undefined} aria-hidden={complete || undefined}>
              {cookerOnTable && <img src={electricCooker}
                className={ui('fried-rice-cooker')} alt="Portable electric cooker" />}
              {cookerOnTable && <span className={ui('fried-rice-cooker-light')}
                data-on={!complete && (warmingOil || finished('heat')) || undefined} aria-hidden="true" />}
              {cooking?.action === 'heat' && <button type="button" className={ui('fried-rice-cooker-dial')}
                data-next="true" aria-label="Turn on the cooker" aria-disabled={warmingOil || undefined}
                aria-busy={warmingOil || undefined} onClick={event => warmOil(event.detail === 0)} />}
              <div className={ui('fried-rice-pan-vessel')} style={eggCrackStyle}>
              {gathered('pan') ? <>
                <img src={supplies.pan.image} className={ui('size-full object-contain fried-rice-item-highlight')} alt="Frying pan" />
                {cooking?.action !== 'heat' && !sweepingCarrot && !holdingSpatula && !holdingEgg && !crackingEgg && <span aria-hidden="true" className={ui('fried-rice-item-label')}>Frying pan</span>}
              </> : placement('pan', 'absolute inset-0')}
              {(finished('oil') || pouringOil) && <span className={ui('fried-rice-oil')}
                data-pouring={pouringOil || undefined} aria-hidden="true" style={{ '--fried-rice-pour-time': `${oilPourMs}ms` } as CSSProperties} />}
              {cooking?.action === 'oil' && <button type="button" className={ui('fried-rice-pan-target')}
                data-next="true" aria-label="Pour oil into the pan" aria-disabled={pouringOil || undefined}
                aria-busy={pouringOil || undefined} onClick={event => pourOil(event.detail === 0)} />}
              {holdingDicedCarrot && <button type="button" className={ui('fried-rice-pan-target')}
                data-next="true" aria-label="Add the carrot to the pan" onClick={event => {
                  setHeld(null)
                  cook(event.detail === 0)
                }} />}
              {holdingSpatula && <button ref={spatulaPanTarget} type="button" className={ui('fried-rice-pan-target')}
                data-next="true" aria-label="Put the spatula in the pan" onClick={event => place(event.detail === 0)} />}
              {cooking?.action === 'egg' && <button type="button" className={ui('fried-rice-pan-target aria-busy:focus-visible:outline-none')}
                data-next="true" aria-label="Crack the egg into the pan" aria-disabled={crackingEgg || undefined}
                aria-busy={crackingEgg || undefined} onClick={event => crackEgg(event.detail === 0)} />}
              {pouringOil && <span className={ui('fried-rice-pouring')} aria-hidden="true"
                style={{ '--fried-rice-pour-time': `${oilPourMs}ms` } as CSSProperties}>
                <img src={supplies.oil.image} className={ui('fried-rice-pour-bottle')} alt="" />
                <span className={ui('fried-rice-oil-stream')} />
              </span>}
              {sweepingCarrot ? <CarrotSweep spatula={supplies.spatula.image} restingSpatula={restingSpatula}
                count={taps} goal={tapGoal} onSweep={cook} /> :
                finished('carrots') && !finished('mix') && <DicedCarrot className="fried-rice-pan-carrot" label="Carrot in the pan"
                  doneness={finished('soften') ? 1 : 0} arriving={previousAction === 'carrots'} />}
              {(crackingEgg || finished('egg')) && !finished('mix') && <img src={finished('scramble') ? scrambledEgg : crackedEgg}
                className={ui('fried-rice-pan-egg')} data-dropping={crackingEgg || undefined}
                alt={crackingEgg ? '' : finished('scramble') ? 'Scrambled egg' : 'Cracked egg'} />}
              {crackingEgg && <EggArt variant="opening" className={ui('fried-rice-cracking-egg')} />}
              {finished('rice') && <img src={friedRice}
                className={ui('fried-rice-pan-rice')} alt={finished('mix') ? 'Fried rice' : 'Rice in the pan'} />}
              </div>
            </div>}
            {counterItem && <div className={ui('fried-rice-work-items')}>{counterSupply(counterItem)}</div>}
            {(keepSpatula || sweepingCarrot) && <img ref={restingSpatula} src={supplies.spatula.image} className={ui('fried-rice-resting-spatula')}
              alt="Spatula set aside" data-in-use={sweepingCarrot || undefined} />}
            {outgoing && <img key={stepIndex} src={supplies[outgoing].image} alt="" aria-hidden="true"
              className={ui('fried-rice-outgoing-item')} />}
          </div>
          {knifeAim && !slidingCarrot && <button type="button" className={ui('fried-rice-aim-area')} data-next="true"
            aria-label="Aim knife and chop" aria-description={`Cut ${taps + 1} of ${tapGoal}, ${cutDirection} the carrot${aligned ? ', lined up' : ''}`}
            aria-disabled={cutting || undefined} onKeyDown={aimWithKeys} onClick={chop}
            onPointerMove={event => {
              if (event.pointerType !== 'touch') setKnifeAim(aimAt(event, 'pointer'))
            }} />}
          {held && (holdingDicedCarrot ? <DicedCarrot ref={node => { heldArt.current = node }} className="fried-rice-held-art" style={heldStyle} /> :
            holdingEgg ? <span ref={heldArt} className={ui('fried-rice-held-art fried-rice-held-egg')} style={heldStyle}>
              <EggArt variant="whole" className="block size-full" />
            </span> :
            <img src={supplies[held.item].image} alt="" aria-hidden="true" data-item={held.item}
              className={ui('fried-rice-held-art')} style={heldStyle} ref={node => { heldArt.current = node }} />)}
        </section>
      </div>
      <aside aria-label="Cooking guide" className={ui('pantry-panel fried-rice-guide')} style={guideStyle}>
        <div aria-live="polite" className="grid gap-3.5">
          <header className={ui('pantry-note-heading')}>
            <h2 className={ui('pantry-title ink-wiggle')}>{practiceComplete ? 'Practice complete' : complete ? 'Fried rice is ready!' : step.title}</h2>
            <p className={ui('pantry-step')}>{practiceComplete ? 'Practice' : complete ? 'Meal ready' : `Step ${stepIndex + 1} of ${recipe.length}`}</p>
          </header>
          <p>{instruction}</p>
          {tapGoal > 1 && <progress className={ui('fried-rice-taps')} value={taps} max={tapGoal} aria-label={`${step.title} progress`} />}
        </div>
        <p role="status" className={mistake || supplyArt ? ui('fried-rice-retry') : 'sr-only'}>
          {supplyArt === 'loading' && gathering ? `Getting the ${supplies[gathering.item].label.toLowerCase()} ready…` :
            supplyArt === 'error' && gathering ? `Couldn’t load. Tap the ${supplies[gathering.item].label.toLowerCase()} to try again.` :
            mistake && gathering ? `Try the ${supplies[gathering.item].label.toLowerCase()}.` : ''}
        </p>
        {practice ? <div className={ui('fried-rice-practice-controls')}>
          <p>Practice · {practice.title}</p>
          <div className="flex flex-wrap gap-x-2">
            <button type="button" className={ui('fried-rice-start-over')} onClick={() => onPractice(practice)}>Try again</button>
            <button type="button" className={ui('fried-rice-start-over')} data-next={practiceComplete || undefined} onClick={onReturn}>Back to recipe</button>
          </div>
        </div> : <div className={ui('fried-rice-practice-controls')}>
          <details className={ui('fried-rice-practice-menu')}>
            <summary className={ui('fried-rice-practice-summary')}>Try again</summary>
            <ul className="grid gap-1 pb-2">
              {recipeGroups.map(group => <li key={group.step}>
                <button type="button" className={ui('fried-rice-practice-option')}
                  disabled={group.start > stepIndex} onClick={() => onPractice(group)}>
                  <span>{group.title}</span>
                  <span className="text-sm whitespace-nowrap">{group.start + 1 === group.end ? `Step ${group.end}` : `Steps ${group.start + 1}–${group.end}`}</span>
                </button>
              </li>)}
            </ul>
          </details>
          {!complete && <button type="button" className={ui('fried-rice-start-over')}
            onClick={() => { reset(); focusNext() }}>Start over</button>}
          {complete && <button type="button" className={ui('cta pantry-continue justify-self-start')} data-next="true"
            onClick={event => { reset(); if (event.detail === 0) focusNext() }}>
            Play again
          </button>}
        </div>}
      </aside>
    </div>
  </main>
}

const initialProgress = readProgress()
const chopEntryArt = [...openingArt, ...carrotPrepArt]

function FriedRiceGame() {
  const mainProgress = useRef(initialProgress)
  const game = useRef<HTMLDivElement>(null)
  const [entry, setEntry] = useState({ checkpoint: initialProgress, practice: null as RecipeGroup | null, version: 0 })
  const assets = stepKey(recipe[entry.checkpoint.stepIndex]) === 'cook:chop' ? chopEntryArt : openingArt

  function returnToRecipe() {
    setEntry(current => ({
      checkpoint: mainProgress.current, practice: null, version: current.version + 1,
    }))
  }

  return <div ref={game} className="contents">
    <ActivityEntry key={entry.version} assets={assets} label="Setting up the kitchen…" errorMessage="The kitchen couldn’t load. Please try again."
      onReady={entry.version ? () => game.current?.querySelector<HTMLButtonElement>('[data-next=true]')?.focus() : undefined}
      cancel={entry.practice ? { label: 'Back to recipe', onClick: returnToRecipe } : undefined}>
      <FriedRice checkpoint={entry.checkpoint} practice={entry.practice}
        onProgress={(stepIndex, taps) => {
          mainProgress.current = { stepIndex, taps }
          saveProgress(stepIndex, taps)
        }} onPractice={group => setEntry(current => ({
          checkpoint: { stepIndex: group.start, taps: 0 }, practice: group, version: current.version + 1,
        }))} onReturn={returnToRecipe} />
    </ActivityEntry>
  </div>
}

createRoot(document.getElementById('root')!).render(<FriedRiceGame />)
