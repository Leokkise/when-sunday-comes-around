import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './wash-up.css'
import { InkFilters } from './ink-filters'

const dirtSpots = [
  { name: 'leaf in the hair', x: 41, y: 9, kind: 'leaf' },
  { name: 'second leaf in the hair', x: 58, y: 13, kind: 'leaf-small' },
  { name: 'leaf near the crown', x: 53, y: 5, kind: 'leaf-small' },
  { name: 'leaf by the left temple', x: 35.5, y: 14, kind: 'leaf-small' },
  { name: 'leaf at the right edge of the hair', x: 64, y: 10, kind: 'leaf-small' },
  { name: 'leaf caught in the fringe', x: 48, y: 14, kind: 'leaf-small' },
  { name: 'mud flecks on the shoulder', x: 40, y: 32, kind: 'speckles' },
  { name: 'dried mud on the upper arm', x: 61, y: 38, kind: 'scuff' },
  { name: 'mud smear on the left forearm', x: 36.5, y: 46, kind: 'smear' },
  { name: 'mud speckles on the right hand', x: 65, y: 57.5, kind: 'speckles' },
  { name: 'dried mud on the left knee', x: 44, y: 72, kind: 'scuff' },
  { name: 'mud speckles on the right knee', x: 56.5, y: 71, kind: 'speckles' },
  { name: 'mud smear on the right shin', x: 56, y: 81, kind: 'smear' },
  { name: 'dried mud on the left shin', x: 43.3, y: 82, kind: 'scuff' },
  { name: 'mud streak on the right forearm', x: 64, y: 49, kind: 'smear' },
  { name: 'mud flecks on the left calf', x: 44, y: 86, kind: 'speckles' },
  { name: 'mud speckles by the ankle', x: 43.5, y: 90, kind: 'speckles' },
  { name: 'mud flecks by the collarbone', x: 49, y: 31, kind: 'speckles' },
  { name: 'mud smear on the upper chest', x: 47, y: 36, kind: 'smear' },
  { name: 'dried mud on the side', x: 55, y: 42, kind: 'scuff' },
  { name: 'dried mud on the left thigh', x: 44, y: 68, kind: 'scuff' },
  { name: 'mud flecks on the right calf', x: 56, y: 86, kind: 'speckles' },
  { name: 'mud streak on the left upper arm', x: 38, y: 39, kind: 'smear' },
  { name: 'mud flecks on the right thigh', x: 56, y: 68, kind: 'speckles' },
  { name: 'dried mud on the left side', x: 45, y: 44, kind: 'scuff' },
  { name: 'mud flecks on the left foot', x: 42, y: 96, kind: 'speckles' },
  { name: 'mud smudge on the right foot', x: 58, y: 96, kind: 'scuff' },
  { name: 'mud flecks on the right chest', x: 55, y: 35, kind: 'speckles' },
  { name: 'mud smear on the lower belly', x: 51.5, y: 47, kind: 'smear' },
  { name: 'dried mud on the left hand', x: 35.5, y: 56, kind: 'scuff' },
  { name: 'mud flecks on the right lower leg', x: 56, y: 91, kind: 'speckles' },
]

const scrapes = [
  { name: 'right knee', x: 56, y: 74, angle: -30 },
  { name: 'left forearm', x: 36.5, y: 51, angle: -38 },
  { name: 'left shin', x: 44, y: 77, angle: -29 },
  { name: 'right shoulder', x: 59.5, y: 32, angle: -36 },
]

const tools = [
  { name: 'Shampoo', x: 75.3, y: 22.2, width: 8, height: 12 },
  { name: 'Sponge', x: 87.9, y: 25, width: 8, height: 6 },
  { name: 'Soap', x: 81.7, y: 25.7, width: 6, height: 5 },
  { name: 'Shower', x: 16, y: 30.5, width: 24, height: 50 },
  { name: 'Bandage', x: 19, y: 66.8, width: 12, height: 7 },
  { name: 'Towel', x: 85, y: 44.5, width: 16, height: 17 },
] as const

type Tool = typeof tools[number]['name']
const hair = [{ name: 'hair', x: 50, y: 11, kind: 'target' }]
const body = [{ name: 'body', x: 50, y: 37, kind: 'target' }]
const bodyWetSpots = [
  { name: 'left arm', x: 37, y: 43, kind: 'target' },
  { name: 'right arm', x: 63, y: 43, kind: 'target' },
  ...body,
  { name: 'left knee', x: 44, y: 74, kind: 'target' },
  { name: 'right knee', x: 56, y: 74, kind: 'target' },
  { name: 'left foot', x: 42, y: 96, kind: 'target' },
  { name: 'right foot', x: 58, y: 96, kind: 'target' },
]
const bodyWaterMarks: Record<string, [string, string]> = {
  'left arm': ['M17 4C10 12 13 20 8 28C5 34 9 37 12 32C16 25 14 16 17 4Z', 'M13 17l-.5 4m-2 6-1 2'],
  'right arm': ['M11 6C16 12 15 20 18 25C21 30 24 27 22 23C18 17 18 11 11 6ZM21 31q-3 4-1 6q4 1 1-6Z', 'M17 18l1 4m3 12v1'],
  body: ['M6 14C13 14 20 7 25 9C23 14 19 15 18 21C17 27 13 27 13 22C13 19 9 21 6 19Q3 17 6 14Z', 'M8 16l4-1m3 6v2'],
  'left knee': ['M9 17Q15 11 22 15Q26 18 22 21Q16 19 11 23Q6 24 9 17ZM17 26q-3 4 0 5q3-1 0-5Z', 'M11 19q3-2 6-2'],
  'right knee': ['M15 13C13 18 8 20 9 24C10 29 16 27 17 23C18 20 16 16 15 13ZM22 20q-2 4 1 5q3-1-1-5Z', 'M12 22l-.5 2'],
  'left foot': ['M5 24Q9 19 14 21Q19 23 24 21Q26 25 21 27Q16 29 12 26Q8 27 5 26Z', 'M8 24l4-1m6 2 3-1'],
  'right foot': ['M9 22q4-4 7 0q1 4-3 5q-5 0-4-5ZM20 25q4-2 6 1q-1 4-5 3q-3-1-1-4Z', 'M11 23l2-1m9 5h2'],
}
function bodyRinseTarget({ x, y }: { x: number; y: number }) {
  if (y >= 60) return (x < 50 ? 'left ' : 'right ') + (y >= 85 ? 'foot' : 'knee')
  if (x < 41) return 'left arm'
  if (x > 59) return 'right arm'
  return 'body'
}

const soapChestSpots = [
  { name: 'left chest', x: 44, y: 38, kind: 'target' },
  ...body,
  { name: 'right chest', x: 56, y: 38, kind: 'target' },
]
const soapSpots = [...bodyWetSpots.filter(spot => spot.name !== 'body'), ...soapChestSpots]
const rinseHairPhase = 3
const dryPhase = 7
const dryingOrder = [['hair'], ['left arm', 'right arm'], ['body'], ['left knee', 'right knee'], ['left foot', 'right foot']]
const scrubArrow = 'M23 6l.5 6M23.5 17l.5 6M24 28l-.5 6M23.5 38v4M18 37l5.5 5.5 5.5-6'
const showerReach = 2.05
const bodyWaterAccents = [
  { name: 'left arm', x: 39, y: 33 },
  { name: 'right arm', x: 61, y: 34 },
  { name: 'left arm', x: 35.5, y: 53 },
  { name: 'right arm', x: 64.5, y: 54 },
  { name: 'body', x: 49, y: 46 },
  { name: 'left knee', x: 43.5, y: 87 },
  { name: 'right knee', x: 56, y: 86 },
]
const scrapeSpots = scrapes.map(scrape => ({ ...scrape, kind: 'scrape' }))
const shampooMoves = 30
// Original bath icons drawn in the hand-drawn style of Oreo Doodle Icons.
const washStepIcons = [
  'M5 27Q10 18 25 7M8 23C4 15 12 7 25 7C26 20 18 27 8 23Z',
  'M5 16V10C5 4 14 4 15 10M10 14Q14 7 21 11L26 15Q19 19 10 14ZM13 20l-1 4m6-4v5m5-5 1 4',
  'M13 4h8m-4 0v6m-4 0h7v4m-9 0h10q4 1 4 5v8q0 2-2 2H9q-2 0-2-2v-8q0-4 4-5Zm2 7h6',
  'M5 17V10Q5 4 13 5L16 10M11 13Q17 7 23 13L26 16Q20 20 11 13Zm4 8-1 4m6-4v6m5-7 2 5M6 26h5',
  'M5 16q0-4 6-5l13 1q5 1 5 5v4q-1 4-6 4H10q-5-1-5-5Zm0 2q5 5 24 1M9 6h.1M22 6h.1',
  'M5 14q0-4 5-5l14-1q5 1 5 5l-1 9q0 3-4 4l-15-1q-4 0-4-4Zm5 1h.1m6-2h.1m7 2h.1m-11 6h.1m9-1h.1',
  'M16 4C13 10 7 15 7 21a9 9 0 0 0 18 0c0-6-6-11-9-17Zm-4 17q0 4 4 5M26 6v6m-3-3h6',
  'M4 8h25M8 8v16l15 3V8M8 20l15 2M26 8v13l-3 2',
  'M6 21 21 6q3-3 6 0t0 6L12 27q-3 3-6 0t0-6Zm5-5 6 6m-1-11 6 6M8 24h.1M24 9h.1',
]

const wettingDirections = ['right', 'left', 'right', 'left', 'right'] as const

const steps: { title: string; hint: string; tool?: Tool; spots: typeof dirtSpots }[] = [
  { title: 'Pick out the leaves', hint: 'Tap each leaf to take it out of the hair.', spots: dirtSpots.filter(spot => spot.kind.startsWith('leaf')) },
  { title: 'Wet the hair', hint: 'Move the shower over the hair from left to right.', tool: 'Shower', spots: hair },
  { title: 'Shampoo the hair', hint: 'Pick up the shampoo.', tool: 'Shampoo', spots: hair },
  { title: 'Rinse and wet', hint: 'Rinse the bubbles out of the hair. Then wet each circle on the body with the shower.', tool: 'Shower', spots: [...hair, ...bodyWetSpots] },
  { title: 'Soap up', hint: 'Pick up the soap.', tool: 'Soap', spots: soapSpots },
  { title: 'Scrub off the dirt', hint: 'Pick the sponge. Scrub up and down.', tool: 'Sponge', spots: dirtSpots.filter(spot => !spot.kind.startsWith('leaf')) },
  { title: 'Rinse off', hint: 'Use the shower to rinse the arms, chest, knees, and feet.', tool: 'Shower', spots: bodyWetSpots },
  { title: 'Dry off', hint: 'Pick up the towel.', tool: 'Towel', spots: [...hair, ...bodyWetSpots] },
  { title: 'Put on bandages', hint: 'Pick up a bandage from the shelf.', tool: 'Bandage', spots: scrapeSpots },
]

function ToolArt({ tool }: { tool: typeof tools[number] }) {
  return <i className={'wash-supply-art wash-supply-' + tool.name.toLowerCase()} aria-hidden="true" />
}

const shinePaths = ['M37 6Q37 10 38 15M33.5 10L42 11', 'M20 31L20.5 39M16 35L24 34.5', 'M78.5 25.5L79 31.5M76 28.5H82']
const shineAnchors = [[37.5, 10.5], [20, 35], [79, 28.5]]

function HairShine() {
  const [offsets, setOffsets] = useState(['0 0', '0 0', '0 0'])

  return <span className="wash-wet-hair" aria-hidden="true">
    <svg className="wash-wet-shine wash-hair-shine" viewBox="0 0 100 45" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
      onAnimationIteration={event => {
        const index = Array.from(event.currentTarget.children).indexOf(event.target as Element)
        const anchor = shineAnchors[index]
        if (!anchor) return
        const angle = Math.random() * Math.PI * 2
        const radius = Math.sqrt(Math.random())
        const x = 50 + Math.cos(angle) * radius * 43
        const y = 24 + Math.sin(angle) * radius * 19
        const offset = `${x - anchor[0]} ${y - anchor[1]}`
        setOffsets(previous => previous.map((position, i) => i === index ? offset : position))
      }}>
      {shinePaths.map((path, index) => (
        <path key={path} d={path} transform={`translate(${offsets[index]})`} />
      ))}
    </svg>
  </span>
}

function BodyShine({ rinsed }: { rinsed: string[] }) {
  const [placements, setPlacements] = useState<{ name: string; x: number; y: number; size: number }[]>([])
  const spots = [
    { name: 'left arm', x: 39, top: 29, bottom: 36 },
    { name: 'right arm', x: 61, top: 29, bottom: 36 },
    { name: 'body', x: 50, top: 34, bottom: 46 },
    { name: 'left knee', x: 44, top: 66, bottom: 80 },
    { name: 'right knee', x: 56, top: 66, bottom: 80 },
    { name: 'left foot', x: 43, top: 83, bottom: 97 },
    { name: 'right foot', x: 57, top: 83, bottom: 97 },
  ].filter(spot => rinsed.includes(spot.name))
  const selected = placements.filter(placement => rinsed.includes(placement.name))
  for (const spot of spots) {
    if (selected.length === shinePaths.length) break
    if (!selected.some(placement => placement.name === spot.name)) {
      selected.push({ name: spot.name, x: spot.x - 2, y: (spot.top + spot.bottom) / 2, size: .3 + selected.length * .3 })
    }
  }

  return <svg className="wash-wet-shine wash-body-shine" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <g>
      {selected.map((spot, index) => (
        <svg key={index}
          x={spot.x - 1 + (6.5 + spot.size * 2.6 - 4.368) / 2}
          y={spot.y - .6 + (4.4 + spot.size * 1.8 - 2.912) / 2}
          width="4.368" height="2.912"
          onAnimationIteration={() => {
            const elsewhere = spots.filter(candidate => !selected.some(placement => placement.name === candidate.name))
            const choices = elsewhere.length ? elsewhere : spots.filter(candidate => candidate.name === spot.name)
            const next = choices[Math.floor(Math.random() * choices.length)]
            if (!next) return
            const placement = {
              name: next.name, x: next.x - 4 + Math.random() * 4,
              y: next.top + Math.random() * (next.bottom - next.top), size: Math.random(),
            }
            setPlacements(selected.map((current, slot) => slot === index ? placement : current))
          }}
          viewBox={`${shineAnchors[index][0] - 7.5} ${shineAnchors[index][1] - 7.5} 15 15`} overflow="visible">
          <path d={shinePaths[index]} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ))}
    </g>
  </svg>
}

const checkpointKey = 'when-sunday-comes-around.wash-up.v1'

function readCheckpoint() {
  try {
    const saved = JSON.parse(localStorage.getItem(checkpointKey) ?? 'null')
    if (!saved || !Number.isInteger(saved.phase) || saved.phase < 0) return
    const hadSeparateBodyStep = saved.hasBodyWetting === true && saved.combinedShower !== true
    const previousPhase: number = hadSeparateBodyStep && saved.phase >= 4 ? saved.phase - 1 : saved.phase
    const skippedScrapeStep = saved.directBandaging !== true && (previousPhase === 8 || previousPhase === 9)
    const phase = saved.directBandaging === true || previousPhase < 8 ? previousPhase : Math.max(8, previousPhase - 2)
    if (phase > steps.length) return
    const step = steps[phase]
    return {
      phase,
      cleaned: skippedScrapeStep ? [] : step?.spots.filter(spot => (hadSeparateBodyStep && saved.phase === 4 && spot.name === 'hair')
        || (Array.isArray(saved.cleaned) && (saved.cleaned.includes(spot.name)
          || (step.tool === 'Soap' && saved.soapChestPasses !== true && spot.name.endsWith('chest') && saved.cleaned.includes('body'))
          || (phase === 6 && saved.bodyRinseTargets !== true && saved.cleaned.includes('body'))
          || (phase === dryPhase && saved.guidedDrying !== true && saved.cleaned.includes('body'))))).map(spot => spot.name) ?? [],
      selected: skippedScrapeStep ? undefined : tools.find(item => item.name === saved.selected)?.name,
      massages: step?.tool === 'Shampoo' && Number.isInteger(saved.massages)
        ? saved.massages === (saved.shampooMoves ?? 4) ? shampooMoves : Math.max(0, Math.min(shampooMoves, saved.massages))
        : 0,
      shampooApplied: step?.tool === 'Shampoo' && (saved.shampooApplied === true || saved.massages > 0),
      wettingPasses: saved.phase === 1 && Number.isInteger(saved.wettingPasses)
        ? saved.wettingPattern !== 2 && saved.wettingPasses >= 2
          ? wettingDirections.length
          : Math.max(0, Math.min(wettingDirections.length, saved.wettingPasses))
        : 0,
    }
  } catch {
    return undefined
  }
}

function WashUp() {
  const [checkpoint] = useState(readCheckpoint)
  const [grabbing, setGrabbing] = useState(false)
  const [phase, setPhase] = useState(checkpoint?.phase ?? 0)
  const [cleaned, setCleaned] = useState<string[]>(checkpoint?.cleaned ?? [])
  const [selected, setSelected] = useState<Tool | undefined>(checkpoint?.shampooApplied ? undefined : checkpoint?.selected)
  const [massages, setMassages] = useState(checkpoint?.massages ?? 0)
  const [shampooApplied, setShampooApplied] = useState(checkpoint?.shampooApplied ?? false)
  const [pouring, setPouring] = useState(false)
  const [shampooCursor, setShampooCursor] = useState<{ x: number; y: number; pointerType: string }>()
  const heldToolCursor = useRef<HTMLSpanElement>(null)
  const [bubblePositions, setBubblePositions] = useState<{ x: number; y: number }[]>([])
  const [wettingPasses, setWettingPasses] = useState(checkpoint?.wettingPasses ?? 0)
  const [spray, setSpray] = useState<{ x: number; y: number; time: number; drift: number } | null>(null)
  const sprayPosition = useRef<typeof spray>(null)
  const sprayElement = useRef<HTMLDivElement>(null)
  const showerPointer = useRef<number | null>(null)
  const resetDialog = useRef<HTMLDialogElement>(null)
  const wettingSweepStarted = useRef(false)
  const massageStart = useRef<{ x: number; y: number } | null>(null)
  const step = steps[phase]
  const shampooing = step?.tool === 'Shampoo'
  const rubbingShampoo = shampooing && shampooApplied
  const requiredTool = rubbingShampoo ? undefined : step?.tool
  const ready = Boolean(step && (!requiredTool || selected === requiredTool))
  const wrong = Boolean(step && selected && selected !== requiredTool)
  const tool = tools.find(item => item.name === selected)
  const wettingHair = phase === 1
  const usingShower = step?.tool === 'Shower'
  const wettingDirection = wettingDirections[wettingPasses]
  const done = !step || (wettingHair ? !wettingDirection : shampooing ? massages === shampooMoves : cleaned.length === step.spots.length)
  const finishedBath = done && phase >= steps.length - 1
  const hairRinsed = phase === rinseHairPhase && cleaned.includes('hair')
  const drying = phase === dryPhase
  const dryGroup = drying ? dryingOrder.findIndex(group => group.some(name => !cleaned.includes(name))) : -1
  const dryGuides = drying ? step.spots.filter(spot => dryingOrder[dryGroup]?.includes(spot.name) && !cleaned.includes(spot.name)) : []
  const hairStillWet = hairRinsed || (phase > rinseHairPhase && (phase < dryPhase || (drying && !cleaned.includes('hair'))))
  const foamCount = shampooing ? massages : phase === rinseHairPhase ? shampooMoves : 0
  const holdingShampoo = shampooing && ready && !shampooApplied
  const soaping = step?.tool === 'Soap'
  const sponging = step?.tool === 'Sponge'
  const spongeSection = ({ x, y }: { x: number; y: number }) => y >= 60 ? 4 : x < 41 || x > 59 ? 0 : x < 47 ? 1 : x < 54 ? 2 : 3
  const spongeRemaining = sponging ? step.spots.filter(spot => !cleaned.includes(spot.name)) : []
  const spongeLane = Math.min(...spongeRemaining.map(spongeSection))
  const spongeGuides = spongeLane === 0 || spongeLane === 4
    ? bodyWetSpots.filter(spot => spot.name.endsWith(spongeLane === 0 ? 'arm' : 'knee')
      && spongeRemaining.some(dirt => spongeSection(dirt) === spongeLane && (dirt.x < 50) === (spot.x < 50)))
    : [{ name: 'body', x: [0, 44, 50, 56][spongeLane], y: 38 }]
  const holdingSoap = soaping && ready && !done
  const holdingSponge = sponging && ready && !done
  const holdingTowel = drying && ready && !done
  const bandaging = step?.tool === 'Bandage'
  const holdingBandage = bandaging && ready && !done
  const soapStart = useRef<string | null>(null)
  const towelStrokeStart = useRef<{ spot: string; y: number } | null>(null)
  const [soapDownSpots, setSoapDownSpots] = useState<string[]>([])
  const soapChest = soapChestSpots.find(spot => !cleaned.includes(spot.name))
  const soapArea = bodyWetSpots.slice(0, 2).some(spot => !cleaned.includes(spot.name))
    ? 'arms' : soapChest ? 'body' : 'legs'

  useEffect(() => {
    try {
      localStorage.setItem(checkpointKey, JSON.stringify({ phase, cleaned, selected, massages, shampooApplied, shampooMoves, wettingPasses, wettingPattern: 2, combinedShower: true, soapChestPasses: true, bodyRinseTargets: true, guidedDrying: true, directBandaging: true }))
    } catch {
      // The game can still run when browser storage is unavailable.
    }
  }, [phase, cleaned, selected, massages, shampooApplied, wettingPasses])

  const progress = wettingHair ? wettingPasses : shampooing ? massages : cleaned.length
  const progressMax = wettingHair ? wettingDirections.length : shampooing ? shampooMoves : step?.spots.length

  function useOn(names: string[]) {
    if (!ready || done || !names.length) return
    setCleaned(previous => [...new Set([...previous, ...names])])
    if (bandaging) {
      setSelected(undefined)
      setShampooCursor(undefined)
    }
  }

  function scrub(event: PointerEvent<HTMLDivElement>) {
    const stage = event.currentTarget
    const starting = event.type === 'pointerdown'
    const prop = event.target instanceof Element ? event.target.closest('.wash-prop') : null
    const pickingTowel = drying && !done && starting && prop?.getAttribute('aria-label') === 'Towel'
    const pickingBandage = bandaging && !done && starting && prop?.getAttribute('aria-label') === 'Bandage'
    const pickingTool = pickingTowel || pickingBandage
    if ((holdingShampoo || holdingSoap || holdingSponge || holdingTowel || holdingBandage || pickingTool) && (!starting || pickingTool)) {
      const bounds = stage.getBoundingClientRect()
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top
      if (heldToolCursor.current && shampooCursor?.pointerType === event.pointerType) {
        heldToolCursor.current.style.transform = `translate(${x}px, ${y}px)`
      } else {
        setShampooCursor({ x, y, pointerType: event.pointerType })
      }
    }
    if (usingShower && (
      (!starting && showerPointer.current === event.pointerId) ||
      (starting && !done && event.isPrimary && event.button === 0 &&
        (prop?.getAttribute('aria-label') === 'Shower' || (!prop && selected === 'Shower')))
    )) {
      if (starting) {
        event.preventDefault()
        stage.setPointerCapture(event.pointerId)
        showerPointer.current = event.pointerId
        setSelected('Shower')
      }
      const bounds = stage.getBoundingClientRect()
      const x = event.clientX
      const y = event.clientY
      const sprayWidth = Math.max(54, Math.min(96, bounds.width * .12))
      const sprayX = x - bounds.left
      // The sprite's neck is .37 sprite heights above the spray outlet.
      const sprayY = y - bounds.top + sprayWidth * .37
      const sprayCenter = bounds.left + sprayX
      const sprayTop = bounds.top + sprayY
      const sprayBottom = sprayTop + sprayWidth * showerReach
      const time = performance.now()
      const previous = sprayPosition.current
      const elapsed = previous ? time - previous.time : 0
      const drift = previous && elapsed > 0 && elapsed < 80
        ? Math.max(-20, Math.min(20, (sprayX - previous.x) * 45 / elapsed))
        : 0
      sprayPosition.current = { x: sprayX, y: sprayY, time, drift }
      if (starting) setSpray(sprayPosition.current)
      sprayElement.current?.style.setProperty('--spray-x', sprayX + 'px')
      sprayElement.current?.style.setProperty('--spray-y', sprayY + 'px')
      if (wettingHair) {
        if (!wettingDirection) return
        const scalp = stage.querySelector('.wash-target')?.getBoundingClientRect()
        if (!scalp || sprayTop > scalp.bottom || sprayBottom < scalp.top) {
          wettingSweepStarted.current = false
          return
        }
        const across = (x - scalp.left) / scalp.width
        const sweepProgress = wettingDirection === 'right' ? across : 1 - across
        if (sweepProgress <= .25) wettingSweepStarted.current = true
        if (wettingSweepStarted.current && sweepProgress >= .75) {
          setWettingPasses(wettingPasses + 1)
        }
        return
      }
      const hits = [...stage.querySelectorAll<HTMLButtonElement>('[data-spot]')].filter(spot => {
        if (phase === rinseHairPhase && !hairRinsed && spot.dataset.spot !== 'hair') return false
        const target = spot.getBoundingClientRect()
        const halfSpray = sprayWidth * .32
        return sprayCenter + halfSpray >= target.left && sprayCenter - halfSpray <= target.right
          && sprayBottom >= target.top && sprayTop <= target.bottom
      })
      if (hits.length) setCleaned(previous => [...new Set([...previous, ...hits.map(spot => spot.dataset.spot!)])])
      return
    }
    if (event.type === 'pointerdown' && event.isPrimary && event.button === 0 &&
        wrong && event.target instanceof Element && !event.target.closest('.wash-prop')) {
      setSelected(undefined)
    }
    if ((!ready && !pickingTool) || done) return
    if (event.type === 'pointerdown') {
      if (event.button !== 0 || !event.isPrimary || (prop && !pickingTool)) return
      event.preventDefault()
      stage.setPointerCapture(event.pointerId)
      if (pickingTowel) setSelected('Towel')
      if (pickingBandage) setSelected('Bandage')
      if (phase === 0 || rubbingShampoo) setGrabbing(true)
    } else if (!stage.hasPointerCapture(event.pointerId)) return
    if (bandaging) return

    const { clientX, clientY } = event
    if (shampooing) {
      const scalp = stage.querySelector('[data-scalp]')?.getBoundingClientRect()
      const x = scalp ? (clientX - scalp.left) / scalp.width : 0
      const y = scalp ? (clientY - scalp.top) / scalp.height : 0
      const onSideLock = y >= .58 && y <= 1.14 && ((x >= .06 && x <= .22) || (x >= .78 && x <= .94))
      if (!scalp || (!onSideLock && Math.abs(2 * x - 1) ** 2.5 + Math.abs(2 * y - 1) ** 2.5 > 1)) {
        massageStart.current = null
        return
      }
      if (!shampooApplied) {
        if (starting) {
          setShampooApplied(true)
          setSelected(undefined)
          setPouring(true)
        }
        return
      }
      if (pouring) return
      const start = massageStart.current
      if (starting || !start) {
        massageStart.current = { x: clientX, y: clientY }
        return
      }
      const dx = clientX - start.x
      const dy = clientY - start.y
      if (Math.hypot(dx, dy) >= scalp.width * .18) {
        massageStart.current = { x: clientX, y: clientY }
        const position = { x, y }
        setBubblePositions(previous => {
          const positions = [...previous]
          positions[massages] = position
          return positions
        })
        setMassages(massages + 1)
      }
      return
    }
    if (soaping || sponging || drying) {
      const character = stage.querySelector('.wash-character')?.getBoundingClientRect()
      if (!character || (event.pointerType === 'mouse' && !(event.buttons & 1))) return
      const x = (clientX - character.left) / character.width * 100
      const y = (clientY - character.top) / character.height * 100
      if (drying && dryGroup === 0) {
        const circle = stage.querySelector('.wash-sponge-guide[data-spot="hair"]')?.getBoundingClientRect()
        if (circle && Math.hypot(clientX - (circle.left + circle.width / 2), clientY - (circle.top + circle.height / 2)) <= circle.width / 2) {
          useOn(['hair'])
        }
        return
      }
      const guides = drying ? dryGuides : sponging ? spongeGuides : soapSpots.filter(spot =>
        (soapArea === 'arms' && spot.name.endsWith('arm')) ||
        (soapArea === 'body' && spot.name === soapChest?.name) ||
        (soapArea === 'legs' && spot.name.endsWith('knee')))
      const lockedGuide = guides.find(spot => soapStart.current === spot.name + '-down' || soapStart.current === spot.name + '-up')
      const dryingLowerBody = drying && dryGroup >= 3
      const guide = lockedGuide && Math.abs(x - lockedGuide.x) <= (dryingLowerBody ? 16 : 12) ? lockedGuide
        : [...guides].sort((a, b) => Math.abs(x - a.x) - Math.abs(x - b.x))
          .find(spot => Math.abs(x - spot.x) <= (dryingLowerBody ? 13 : spot.name === 'body' ? 8 : 10))
      if (!guide) {
        soapStart.current = null
        towelStrokeStart.current = null
        return
      }
      if (dryingLowerBody) {
        const onThigh = dryGroup === 3
        if (y < (onThigh ? 61 : 84) || y > (onThigh ? 84 : 103)) {
          soapStart.current = null
          towelStrokeStart.current = null
          return
        }
        const goingUp = soapDownSpots.includes(guide.name)
        const stroke = guide.name + (goingUp ? '-up' : '-down')
        soapStart.current = stroke
        const anchor = towelStrokeStart.current
        if (starting || anchor?.spot !== stroke) {
          towelStrokeStart.current = { spot: stroke, y }
          return
        }
        const distance = goingUp ? anchor.y - y : y - anchor.y
        if (distance < 0) towelStrokeStart.current = { spot: stroke, y }
        if (distance >= (onThigh ? 2.8 : 1.8)) {
          if (goingUp) {
            useOn([guide.name])
            soapStart.current = null
            towelStrokeStart.current = null
          } else {
            setSoapDownSpots(previous => [...new Set([...previous, guide.name])])
            towelStrokeStart.current = { spot: guide.name + '-up', y }
          }
        }
        return
      }
      const leg = guide.name.endsWith('knee')
      const top = drying ? [0, 33, 36, 70, 91][dryGroup] : leg ? 72 : 36
      const bottom = drying ? [0, 48, 46, 75, 95][dryGroup] : leg ? 90 : (sponging ? guide.name === 'body' : soapArea === 'body') ? 44 : 51
      const names = drying ? [guide.name] : sponging
        ? spongeRemaining.filter(spot => spongeSection(spot) === spongeLane
          && (guide.name === 'body' || (spot.x < 50) === (guide.x < 50))).map(spot => spot.name)
        : leg ? [guide.name, guide.name.replace('knee', 'foot')] : [guide.name]
      if (!names.some(name => !cleaned.includes(name))) return
      const goingUp = names.some(name => soapDownSpots.includes(name))
      const atStart = goingUp ? y >= bottom : y <= top
      const atEnd = goingUp ? y <= top : y >= bottom
      const stroke = guide.name + (goingUp ? '-up' : '-down')
      if (atStart) soapStart.current = stroke
      else if (soapStart.current !== stroke) soapStart.current = null
      if (!starting && atEnd && soapStart.current === stroke) {
        soapStart.current = null
        if (goingUp) useOn(names)
        else setSoapDownSpots(previous => [...new Set([...previous, ...names])])
      }
      return
    }
    const hits = [...stage.querySelectorAll<HTMLButtonElement>('[data-spot]:not(:disabled)')].filter(spot => {
      const rect = spot.getBoundingClientRect()
      return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
    })
    if (phase === 0 && hits.length) setSelected(undefined)
    useOn(hits.map(spot => spot.dataset.spot!))
  }

  function goTo(next: number) {
    towelStrokeStart.current = null
    soapStart.current = null
    setSoapDownSpots([])
    showerPointer.current = null
    wettingSweepStarted.current = false
    setWettingPasses(0)
    setSpray(null)
    sprayPosition.current = null
    massageStart.current = null
    setMassages(0)
    setShampooApplied(false)
    setPouring(false)
    setShampooCursor(undefined)
    if (next !== 3) setBubblePositions([])
    setGrabbing(false)
    setPhase(next)
    setSelected(undefined)
    setCleaned([])
  }

  return (
    <main className="wash-page">
      <InkFilters />
      <svg className="ink-filters" width="0" height="0" aria-hidden="true">
        <filter id="bath-paper-key" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1 -3 -1 0 4.8" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
      </svg>
      <a className="wash-back" href="/" aria-label="Back to When Sunday Comes Around"><svg className="ink-wiggle" viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M29 18c-5 1-14 0-22 0m0 0 8-8m-8 8 8 8" /></svg></a>
      <section className="wash-layout" aria-labelledby="wash-title">
        <div className="wash-panel" data-wetting-hair={wettingHair}>
          {!finishedBath && step && <div className="wash-step-number">
            <svg className="ink-wiggle" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d={washStepIcons[phase]} /></svg>
            <span>Step <strong>{phase + 1}</strong> of {steps.length}</span>
          </div>}
          <h1 id="wash-title" className="ink-wiggle">{finishedBath ? 'Bath done!' : step?.title}</h1>
          <p>{finishedBath ? 'All clean and dry. Nice work!' : shampooing && ready
            ? done ? 'Nice work! Now wash off the bubbles.'
              : pouring ? 'Adding shampoo…'
              : shampooApplied ? 'Press and drag to gently rub the shampoo into the hair.'
              : 'Tap the circle on the hair to add shampoo.'
            : soaping && ready && !done
              ? soapArea === 'arms' ? 'Follow the arrows. Rub down, then up on each arm.'
                : soapArea === 'body' ? `Rub down, then up ${soapChest?.name === 'body' ? 'in the middle of the chest' : soapChest?.name === 'left chest' ? 'on the left side of the chest' : 'on the right side of the chest'}.`
                : 'Follow the arrows. Rub down, then up on the knees and feet.'
              : sponging && ready && !done
                ? ['Scrub up and down on the arms.', 'Scrub up and down on the left side of the chest.', 'Now scrub up and down in the middle.', 'Scrub up and down on the right side of the chest.', 'Scrub up and down from the knees to the feet.'][spongeLane]
                : holdingTowel
                  ? ['Touch the circle on the hair with the towel.', 'Wipe down, then up on both shoulders.', 'Wipe down, then up on the chest.', 'Wipe down, then up on both thighs.', 'Wipe down, then up on both feet.'][dryGroup]
                : holdingBandage ? 'Drag the bandage onto a cut.'
                  : step?.hint}</p>
          {!finishedBath && step && <div className="wash-step-progress">
            <div className="wash-progress-row" aria-live="polite">
              <strong>{phase === 0 ? `${progress} of ${progressMax} leaves removed` : wettingHair ? `${progress} of ${progressMax} moves` : `${progress} / ${progressMax} ${shampooing ? 'rubs' : step.tool === 'Sponge' ? 'spots cleaned' : step.tool === 'Bandage' ? 'cuts covered' : 'done'}`}</strong>
              {wettingHair && wettingDirection && <span className="wash-next-sweep">Move {wettingDirection} <span aria-hidden="true">{wettingDirection === 'right' ? '→' : '←'}</span></span>}
            </div>
            <progress aria-label={step.title} value={progress} max={progressMax} />
          </div>}
          {!finishedBath && step && <div className="wash-feedback-slot" data-done={done}>
            <p className="wash-feedback" data-wrong={wrong} role="status">{shampooing && !wrong ? '' : done ? 'Nice work!' : wrong ? (rubbingShampoo ? 'Use your hands to rub the hair.' : requiredTool ? `Find the ${requiredTool.toLowerCase()}.` : 'Use your hands to pick up the leaves.') : !ready && requiredTool && !step.hint.startsWith('Pick ') ? `Pick up the ${requiredTool.toLowerCase()}.` : !wettingHair && step.spots.length === 1 && selected ? `Use the ${selected.toLowerCase()} on the marked spot.` : ''}</p>
          </div>}

          <div className="wash-actions">
            {done && <button className="cta" type="button" onClick={() => goTo(finishedBath ? 0 : phase + 1)}>{finishedBath ? <span className="ink-wiggle">Play again</span> : 'Next step'}</button>}
            {done && !finishedBath && <button className="cta wash-retry" type="button" onClick={() => goTo(phase)}>Try again</button>}
          </div>
        </div>
        <div className="wash-stage" data-wetting-hair={wettingHair} data-grabbing={grabbing} onPointerLeave={() => setShampooCursor(undefined)} onLostPointerCapture={event => {
          soapStart.current = null
          towelStrokeStart.current = null
          setGrabbing(false)
          if (showerPointer.current === event.pointerId) {
            showerPointer.current = null
            wettingSweepStarted.current = false
            setSpray(null)
            sprayPosition.current = null
          }
        }} data-sponge={ready && selected === 'Sponge'} onPointerDown={scrub} onPointerMove={scrub} onPointerUp={event => {
          if (!holdingBandage || !event.currentTarget.hasPointerCapture(event.pointerId)) return
          const scrape = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-bandage-target]')].find(target => {
            const rect = target.getBoundingClientRect()
            return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom
          })
          if (scrape?.dataset.bandageTarget) useOn([scrape.dataset.bandageTarget])
        }}>
          <div className="wash-props" role="group" aria-label="Bath supplies">
            {tools.map(item => (
              <button className="wash-prop" key={item.name} type="button" aria-label={item.name} aria-pressed={selected === item.name}
                disabled={!step || done} onClick={() => setSelected(item.name)}
                style={{ left: item.x + '%', top: item.y + '%', width: item.width + '%', height: item.height + '%' }}>
                <ToolArt tool={item} />
                <span>{item.name}</span>
                {wrong && selected === item.name && <b className="wash-tool-x" aria-hidden="true">×</b>}
              </button>
            ))}
          </div>
          {(holdingShampoo || holdingSoap || holdingSponge || holdingTowel || holdingBandage) && shampooCursor && <span ref={heldToolCursor} className="wash-shampoo-cursor" data-soap={holdingSoap} data-sponge={holdingSponge} data-towel={holdingTowel} data-bandage={holdingBandage} data-pointer-type={shampooCursor.pointerType} style={{ transform: `translate(${shampooCursor.x}px, ${shampooCursor.y}px)` }} aria-hidden="true"><i className={'wash-supply-art wash-supply-' + (holdingBandage ? 'bandage' : holdingTowel ? 'towel' : holdingSponge ? 'sponge' : holdingSoap ? 'soap' : 'shampoo')} /></span>}
          <div className="wash-stage-controls">
            {tool && phase !== 0 && <div className="wash-held" data-wrong={wrong}><ToolArt tool={tool} />{tool.name}</div>}
          </div>
          {spray && <div ref={sprayElement} className="wash-spray" style={{ '--spray-x': spray.x + 'px', '--spray-y': spray.y + 'px', '--shower-reach': showerReach } as CSSProperties} aria-hidden="true">
            <svg className="wash-spray-head" viewBox="0 0 1 1"><image href="/handheld-shower.webp" width="2" height="2" /></svg>
            {Array.from({ length: 16 }, (_, index) => (
              <img key={index} className="wash-spray-drop" src="/shower-droplet.svg" alt=""
                onAnimationIteration={event => {
                  const position = sprayPosition.current
                  if (!position) return
                  event.currentTarget.style.setProperty('--drop-x', position.x + 'px')
                  event.currentTarget.style.setProperty('--drop-y', position.y + 'px')
                  event.currentTarget.style.setProperty('--drop-drift', (performance.now() - position.time < 80 ? position.drift : 0) + 'px')
                }}
                ref={element => {
                  if (element && !element.style.getPropertyValue('--drop-x')) {
                    element.style.setProperty('--drop-x', spray.x + 'px')
                    element.style.setProperty('--drop-y', spray.y + 'px')
                  }
                }}
                style={{ left: `calc(var(--drop-x, var(--spray-x)) + ${21 + (index % 4) * 17 + Math.floor(index / 4) * 3}%)`, animationDelay: '-' + (index * 45) + 'ms' }} />
            ))}
          </div>}
          <div className="wash-character">
            <img src="/bath-sprite.webp" alt="Pencil-drawn character in striped boxer shorts" width="1024" height="1536" draggable={false} />
            {(wettingHair || shampooing || phase === rinseHairPhase || hairStillWet) && <span className="wash-wet-hair" aria-hidden="true">
              <svg className="wash-hair-detail" viewBox="0 0 100 45" fill="none" strokeLinecap="round"
                style={{ opacity: wettingHair ? wettingPasses / wettingDirections.length : 1 }}>
                <defs>
                  <linearGradient id="wash-hair-film" x2="0" y2="1">
                    <stop stopColor="#94bfce" stopOpacity=".43" />
                    <stop offset=".65" stopColor="#93c1d4" stopOpacity=".72" />
                    <stop offset="1" stopColor="#a5d2e4" stopOpacity=".94" />
                  </linearGradient>
                </defs>
                <path fill="url(#wash-hair-film)" d="M36 12C26 15 17 24 13 32C11 37 12 40 15 39C19 38 18 32 21 28C23 25 25 29 28 26C31 23 30 18 36 12Z
                  M57 4Q47 3 42 7Q39 10 42 11Q45 11 48 8Q52 5 57 4Z
                  M10 31Q3 37 2 44Q1 48 3.5 48Q6 47 6 43Q7 36 10 31Z
                  M56 14C51 19 45 28 43 33C41 38 43 41 46 40C50 39 49 32 51 29C53 26 55 29 57 26C59 23 56 19 56 14Z
                  M94 36Q98 41 98 47Q98 50 96 50Q94 50 94.5 46Q95 40 94 36Z
                  M68 13C76 15 83 21 88 29C91 34 93 39 90 41C87 43 84 39 84 35C83 29 81 27 78 28C74 29 74 23 73 20C72 17 70 15 68 13Z" />
                <path d="M16 34l-1 2M23 23l2-2m2-2 2-1M43 8l2-1.5M46 35l-.5 2M50 27l1-2M77 20l2 2m2 2 1 2M88 36l.7 2"
                  stroke="#d7e8eb" strokeWidth="1" opacity=".85" />
                <path d="M17 32l2-4m2-3 1.5-2M4 43l.7-2M46 33l1.5-3m3-6 1.3-2M96.5 45v2M78 24l1 1.6m5 4 1 2m3 3 .7 2"
                  stroke="#e2eaeb" strokeWidth=".6" opacity=".68" />
              </svg>
            </span>}
            {shampooing && shampooApplied && massages === 0 && <span className="wash-shampoo-dab" aria-hidden="true" />}
            {pouring && <span className="wash-shampoo-pour" aria-hidden="true" onAnimationEnd={() => setPouring(false)}><i className="wash-supply-art wash-supply-shampoo" /></span>}
            {foamCount > 0 && <span className="wash-scalp-foam" data-rinsed={hairRinsed} aria-hidden="true">
              {Array.from({ length: foamCount }, (_, index) => {
              const radius = .43 * Math.sqrt((index + .5) / shampooMoves)
              const angle = index * 2.4
              const position = bubblePositions[index] ?? (
                index % 9 < 2 ? { x: index % 9 === 0 ? .14 : .86, y: .77 + Math.floor(index / 9) * .1 }
                  : { x: .5 + radius * Math.cos(angle), y: .5 + radius * Math.sin(angle) }
              )
              const sideLock = position.x <= .22 || position.x >= .78
              const top = sideLock ? Math.max(8, Math.min(106, position.y * 100)) : 7 + position.y * 66
              return <i key={index} style={{ left: Math.max(8, Math.min(92, position.x * 100)) + '%', top: top + '%', '--rinse-delay': index * 35 + 'ms' } as CSSProperties} />
            })}</span>}
            {(hairRinsed || phase > rinseHairPhase) && <HairShine />}
            {(phase > 6 || (phase === 6 && cleaned.length > 0)) && <BodyShine rinsed={phase === 6 ? cleaned : bodyWetSpots.map(spot => spot.name)} />}
            {phase >= rinseHairPhase && phase <= dryPhase && [...bodyWetSpots, ...bodyWaterAccents].map((spot, index) => (
              <svg key={index} className="wash-body-water" data-accent={index >= bodyWetSpots.length} viewBox="0 0 30 40" aria-hidden="true"
                style={{ left: spot.x + '%', top: spot.y + '%', opacity: drying ? Number(!cleaned.includes(spot.name)) : Number(phase > rinseHairPhase || cleaned.includes(spot.name)) }}>
                <path d={bodyWaterMarks[spot.name][0]} fill="#92c0d4" fillOpacity=".8" />
                <path d={bodyWaterMarks[spot.name][1]} fill="none" stroke="#d7e8eb" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            ))}
            {(soaping || (phase === 5 && !done)) && soapSpots.map(spot => (
              <svg key={spot.name} className="wash-body-water wash-soap-mark" viewBox="0 0 30 40" aria-hidden="true"
                style={{ left: spot.x + '%', top: spot.y + '%', opacity: !soaping || cleaned.includes(spot.name) || soapDownSpots.includes(spot.name) ? 1 : 0 }}>
                <path d={(bodyWaterMarks[spot.name] ?? bodyWaterMarks.body)[0]} fill="#f6ead1" fillOpacity=".9" stroke="#b9a485" strokeWidth=".65" />
                <path d={(bodyWaterMarks[spot.name] ?? bodyWaterMarks.body)[1]} fill="none" stroke="#fffaf0" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            ))}
            {(phase === 5 || phase === 6) && <span className="wash-scalp-foam wash-body-lather" aria-hidden="true">
              {[...dirtSpots.filter(spot => !spot.kind.startsWith('leaf')),
                { name: 'mud flecks by the collarbone', x: 55, y: 28 },
              ].flatMap(spot => {
                const offsets = spot.x >= 41 && spot.x < 50 && spot.y < 60 ? [-1, 0, 1, -2, 2, 3, -3, -4] : [-1, 0, 1, -2, 2, 3]
                return offsets.map((offset, index) => (
                  <i key={`${spot.name}-${spot.x}-${offset}`} data-washed={phase === 6 && cleaned.includes(bodyRinseTarget(spot))} hidden={phase === 5 && !cleaned.includes(spot.name) && (!soapDownSpots.includes(spot.name) || index >= 3)}
                    style={{ left: spot.x + offset * 1.4 + '%', top: spot.y + offset * 1.45 + '%' }} />
                ))
              })}
            </span>}
            {shampooing && ready && !done && <div className="wash-scalp-target" data-scalp aria-hidden="true" />}
            {holdingShampoo && <span className="wash-spot wash-target wash-sponge-guide" data-shower-target="true" data-spot="hair"
              style={{ left: hair[0].x + '%', top: hair[0].y + '%' }} aria-hidden="true" />}
            {scrapes.map(scrape => {
              const style = { left: scrape.x + '%', top: scrape.y + '%' }
              const finished = cleaned.includes(scrape.name)
              const covered = !step || (bandaging && finished)
              if (bandaging && !finished) {
                return <button key={scrape.name} className="wash-spot" type="button" style={style} data-bandage-target={scrape.name}
                  disabled={!ready} aria-label={'Cover the cut on the ' + scrape.name} onClick={() => useOn([scrape.name])}>
                  <i className="dirt dirt-scrape" aria-hidden="true" />
                </button>
              }
              return <span key={scrape.name} className="wash-spot wash-decoration" style={style} role="img"
                aria-label={(covered ? 'Bandage' : 'Small cut') + ' on the ' + scrape.name}>
                <i className={covered ? 'wash-supply-art wash-supply-bandage' : 'dirt dirt-scrape'} style={covered ? { rotate: scrape.angle + 'deg' } : undefined} />
              </span>
            })}
            {dirtSpots.map(spot => {
              const isLeaf = spot.kind.startsWith('leaf')
              const active = isLeaf ? phase === 0 : sponging && spongeSection(spot) === spongeLane
              const visible = isLeaf ? phase === 0 : phase <= 6
              const cleared = cleaned.includes(spot.name)
              if (!visible) return null
              const style = { left: spot.x + '%', top: spot.y + '%' }
              const art = <span className={'dirt dirt-' + spot.kind} aria-hidden="true" />
              return active && (isLeaf || !cleared)
                ? <button className="wash-spot" type="button" key={spot.name} style={style} data-spot={spot.name} data-falling={isLeaf && cleared} disabled={!ready || cleared} aria-label={'Clean ' + spot.name} onClick={isLeaf ? () => { setSelected(undefined); useOn([spot.name]) } : undefined}>{art}</button>
                : <span className="wash-spot wash-decoration wash-rinse-layer" data-washed={phase === 6 && cleaned.includes(bodyRinseTarget(spot))} key={spot.name} style={style}>{art}</span>
            })}
            {sponging && ready && !done && spongeGuides.map(spot => {
              const up = spongeRemaining.some(dirt => spongeSection(dirt) === spongeLane
                && (spot.name === 'body' || (dirt.x < 50) === (spot.x < 50))
                && soapDownSpots.includes(dirt.name))
              return (
              <span key={spot.name} className="wash-spot wash-target wash-sponge-guide" data-spot={spot.name} data-soap-guide={spongeLane === 0 ? 'arms' : spongeLane === 4 ? 'legs' : 'body'} style={{ left: spot.x + '%', top: spot.y + '%' }} aria-hidden="true">
                <svg key={String(up)} data-up={up} className="ink-wiggle" viewBox="0 0 48 48" fill="none"><path d={scrubArrow} /></svg>
              </span>
              )
            })}
            {holdingTowel && dryGuides.map(spot => {
              const up = soapDownSpots.includes(spot.name)
              return <span key={spot.name} className="wash-spot wash-target wash-sponge-guide" data-shower-target={dryGroup === 0} data-soap-guide={dryGroup === 0 ? undefined : ['arms', 'body', 'dry-thigh', 'dry-foot'][dryGroup - 1]} data-spot={spot.name}
                style={{ left: spot.x + '%', top: (dryGroup === 1 ? 39 : dryGroup === 3 ? 72 : dryGroup === 4 ? 90 : spot.y) + '%' }} aria-hidden="true">
                {dryGroup !== 0 && <svg key={String(up)} className="ink-wiggle" data-up={up} viewBox="0 0 48 48" fill="none"><path d={scrubArrow} /></svg>}
              </span>
            })}
            {!shampooing && !drying && step?.spots.filter(spot => spot.kind === 'target' && (!cleaned.includes(spot.name)
              || (soaping && soapArea === 'legs' && !cleaned.includes(spot.name.replace(/knee|foot/, part => part === 'knee' ? 'foot' : 'knee'))))
              && (!soaping || (soapArea === 'arms' ? spot.name.endsWith('arm') : soapArea === 'body' ? spot.name === soapChest?.name : spot.y >= 74))).map(spot => (
              <button key={spot.name} className="wash-spot wash-target" data-shower-target={phase === rinseHairPhase || phase === 6} data-soap-guide={soaping ? soapArea : undefined} type="button" style={{ left: spot.x + '%', top: spot.y + '%' }}
                data-spot={spot.name} disabled={!ready || (phase === rinseHairPhase && !hairRinsed && spot.name !== 'hair')} aria-label={soaping ? 'Rub soap on the ' + spot.name : step.title} onClick={wettingHair || soaping ? undefined : () => useOn([spot.name])}>
                {holdingSoap && !((soapArea === 'legs') && spot.name.endsWith('foot')) && <svg className="ink-wiggle" key={String(soapDownSpots.includes(spot.name))} data-up={soapDownSpots.includes(spot.name)} viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <path d={scrubArrow} />
                </svg>}
              </button>
            ))}
          </div>
        </div>
        {!finishedBath && (phase > 0 || cleaned.length > 0 || selected) && <button className="wash-reset" type="button" onClick={() => resetDialog.current?.showModal()}>Start over</button>}
      </section>
      <dialog ref={resetDialog} className="wash-reset-dialog" aria-labelledby="wash-reset-title" aria-describedby="wash-reset-description">
        <h2 id="wash-reset-title" className="wash-motion-text ink-wiggle">Start over?</h2>
        <p id="wash-reset-description">You’ll go back to the first step. Your game will start fresh.</p>
        <div className="wash-actions">
          <button className="cta" type="button" autoFocus onClick={() => resetDialog.current?.close()}>Keep playing</button>
          <button className="cta wash-retry" type="button" onClick={() => {
            resetDialog.current?.close()
            goTo(0)
          }}>Start over</button>
        </div>
      </dialog>
    </main>
  )
}

const bathArtwork = ['/bathroom.webp', '/bath-sprite.webp', '/bath-dirt.webp', '/bath-fixtures.webp', '/bath-supplies.webp']

function BathEntry() {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [showLoading, setShowLoading] = useState(() => performance.now() >= 500)

  useEffect(() => {
    let active = true
    const showAt = attempt ? performance.now() + 500 : 500
    const showTimer = window.setTimeout(() => setShowLoading(true), Math.max(0, showAt - performance.now()))
    let finishTimer: number | undefined
    Promise.all(bathArtwork.map(source => {
      const image = new Image()
      image.src = source
      return image.decode().then(() => {
        if (active) setLoaded(previous => previous + 1)
      })
    })).then(
      () => {
        if (!active) return
        if (performance.now() >= showAt && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          finishTimer = window.setTimeout(() => setState('ready'), 400)
        } else {
          setState('ready')
        }
      },
      () => { if (active) setState('error') },
    )
    return () => {
      active = false
      window.clearTimeout(showTimer)
      window.clearTimeout(finishTimer)
    }
  }, [attempt])

  if (state === 'ready') return <WashUp />
  if (state === 'loading' && !showLoading) return null

  return <main className="wash-page wash-loading">
    <InkFilters />
    <div className="wash-loading-message">
      <p className={state === 'loading' ? 'ink-wiggle' : undefined} role="status">{state === 'error' ? 'The bath couldn’t load.' : 'Getting the bath ready…'}</p>
      {state === 'loading' && <div className="wash-loading-progress" role="progressbar"
        aria-label="Bath images loaded" aria-valuemin={0} aria-valuemax={bathArtwork.length} aria-valuenow={loaded}>
        <span style={{ transform: `scaleX(${loaded / bathArtwork.length})` }} />
      </div>}
      {state === 'error' && <button className="cta" type="button" onClick={() => {
        setLoaded(0)
        setShowLoading(false)
        setState('loading')
        setAttempt(previous => previous + 1)
      }}>Retry</button>}
    </div>
    <a className="wash-loading-back" href="/">Back to home</a>
  </main>
}

createRoot(document.getElementById('root')!).render(<BathEntry />)
