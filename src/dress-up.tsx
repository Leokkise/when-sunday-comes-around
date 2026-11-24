import { useId, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ActivityEntry } from './activity-loading'
import { BathBandages, SmilingCharacterArt, bathSprite, brushFinishMouth } from './bath-scene'
import { bedtimeChoices, bedtimeOutfits, GarmentArt, garmentAsset, garmentName, garments, type BedtimeOutfit, type Garment } from './bedtime-outfits'
import { categoryPreviews, wardrobePreviews } from './wardrobe-previews'
import { WardrobeThumbnail } from './wardrobe-thumbnail'
import { loadImages } from './image-loading'
import { InkFilters } from './ink-filters'
import { ui } from './ui-classes'

const bedroom = '/bedtime/pajama-bedroom.webp'
const assets = [bedroom, bathSprite, brushFinishMouth, '/shared/bath-supplies.webp', ...Object.values(categoryPreviews),
  ...bedtimeOutfits.slice(0, 3).map(choice => wardrobePreviews[choice.id].sets!)]

type Outfit = Partial<Record<Garment, BedtimeOutfit>>
const categories = {
  sets: { label: 'Pajama sets', category: 'Sets', item: 'pajama set' },
  ...garments,
}
type Category = keyof typeof categories
const categoryNames = (Object.keys(categories) as Category[]).filter(name =>
  name === 'sets' || bedtimeChoices.some(choice => choice.parts.includes(name)))
const layers: Garment[] = ['socks', 'pants', 'top', 'headwear', 'mask']

function matchesSet(outfit: Outfit, choice: BedtimeOutfit) {
  return layers.every(garment => outfit[garment] === (choice.parts.includes(garment) ? choice : undefined))
}

// Tuck the hair and original shorts under the replacement layers.
function WornBodyMask({ id, outfit }: { id: string; outfit: Outfit }) {
  const hairCover = outfit.headwear?.hairCover ?? (outfit.headwear?.hoodLining ? 65 : 0)
  return <svg className="absolute size-0" width="0" height="0" aria-hidden="true">
    <mask id={id} maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
      <rect width="1" height="1" fill="white" />
      <g transform="scale(.001111111 .000740741)" fill="black">
        {hairCover > 0 && <rect width="900" height={hairCover} />}
        {outfit.top?.coversArms && <path d="M285 390H396V718H285ZM504 390H615V718H504Z" />}
        {outfit.pants && <path d="M352 646 Q450 666 548 646 Q552 686 556 721 Q559 754 563 783 Q562 793 570 819 L574 829 Q580 837 595 884 H617 V1230 H281 V884 H305 Q315 842 324 831 L331 820 Q340 791 340 777 Q342 746 344 721 Q345 676 352 646Z" />}
        {outfit.socks && <rect x="300" y="1205" width="300" height="145" />}
      </g>
    </mask>
  </svg>
}

function DressUp() {
  const [outfit, setOutfit] = useState<Outfit>({})
  const [category, setCategory] = useState<Category>('sets')
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectionError, setSelectionError] = useState(false)
  const selectionRequest = useRef(0)
  const options = useRef<HTMLDivElement>(null)
  const wearing = useRef<HTMLDivElement>(null)
  const bodyMask = useId()
  const ready = Boolean(outfit.top && outfit.pants)
  const equipped = [...layers].reverse().filter(garment => outfit[garment])
  const worn = layers.flatMap(garment => {
    const choice = outfit[garment]
    return choice ? [`${choice.name} ${garmentName(garment, choice)}`] : []
  })
  const currentSet = bedtimeOutfits.find(choice => matchesSet(outfit, choice))
  const selected = category === 'sets' ? currentSet : outfit[category]
  const choices = category === 'sets' ? bedtimeOutfits : bedtimeChoices.filter(choice => choice.parts.includes(category))
  const coveredBandages = [
    ...(outfit.top ? ['right shoulder', 'left forearm'] : []),
    ...(outfit.pants ? ['right knee', 'left shin'] : []),
  ]

  async function applyOutfit(next: Outfit) {
    const request = ++selectionRequest.current
    setLoading(true)
    setSelectionError(false)
    try {
      await loadImages(layers.flatMap(garment => next[garment] ? [garmentAsset(next[garment]!, garment)] : []))
      if (request === selectionRequest.current) {
        setOutfit(next)
        setFinished(false)
      }
    } catch {
      if (request === selectionRequest.current) setSelectionError(true)
    } finally {
      if (request === selectionRequest.current) setLoading(false)
    }
  }

  function choose(choice: BedtimeOutfit) {
    void applyOutfit(category === 'sets'
      ? matchesSet(outfit, choice) ? {} : Object.fromEntries(choice.parts.map(garment => [garment, choice]))
      : { ...outfit, [category]: outfit[category] === choice ? undefined : choice })
  }

  function takeOff(garment: Garment, index: number) {
    selectionRequest.current++
    setLoading(false)
    setSelectionError(false)
    setOutfit(previous => ({ ...previous, [garment]: undefined }))
    setFinished(false)
    requestAnimationFrame(() => {
      const buttons = wearing.current?.querySelectorAll('button')
      const next = buttons?.[Math.min(index, buttons.length - 1)]
      const target = next ?? options.current?.querySelector('button')
      target?.focus()
    })
  }

  function shuffle() {
    const mixed: Outfit = {}
    for (const garment of layers) {
      if ((garment === 'headwear' || garment === 'mask') && Math.random() < 0.5) continue
      const candidates = bedtimeChoices.filter(choice => choice.parts.includes(garment)
        && choice !== outfit[garment] && (garment !== 'top' || choice !== mixed.pants))
      mixed[garment] = candidates[Math.floor(Math.random() * candidates.length)]
    }
    void applyOutfit(mixed)
    setCategory('sets')
    setFinished(false)
    options.current?.scrollTo({ top: 0 })
  }

  return <main className={ui('dress-page activity-type')}>
    <InkFilters />
    <a href="/brush-teeth/" className={ui('wash-back dress-back')} aria-label="Back to Brush Teeth">
      <svg className={ui('ink-wiggle')} viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <path d="M29 18c-5 1-14 0-22 0m0 0 8-8m-8 8 8 8" />
      </svg>
    </a>
    <div className={ui('dress-layout')}>
      <header className={ui('dress-header')}>
        <h1 className={ui('ink-wiggle [font-size:clamp(2rem,calc(1.4rem_+_2.5vw),3.375rem)]')}>Bedtime!</h1>
        <p className={finished ? 'mt-2 [font-size:var(--game-body-size)] leading-snug' : 'sr-only'} role="status">
          {finished ? 'Snug and ready for bed. Good night!' : currentSet
            ? `${currentSet.name} pajamas picked!` : worn.length > 0 && `Your mix: ${worn.join(', ')}.`}
        </p>
      </header>
      <div className={ui('dress-preview')}>
        <div className="absolute inset-0 grid [place-items:end_center]" role="img" aria-label={worn.length
          ? `Your friend in the bedroom wearing ${worn.join(', ')}`
          : 'Your friend smiling in the bedroom, ready to pick pajamas'}>
          <img src={bedroom} alt="" width="1200" height="900" draggable={false} className="absolute inset-0 size-full object-cover" />
          <div className={ui('wash-character w-[45%]! mb-[2.5%]!')} aria-hidden="true">
            <WornBodyMask id={bodyMask} outfit={outfit} />
            {outfit.headwear?.hoodLining && <svg viewBox="0 0 900 1350" className="pointer-events-none absolute inset-0 size-full">
              <ellipse cx="450" cy="234" rx="150" ry="132" fill={outfit.headwear.hoodLining} />
            </svg>}
            <SmilingCharacterArt bodyMask={`url(#${bodyMask})`} />
            <BathBandages hidden={coveredBandages} />
            {layers.map(garment => {
              const choice = outfit[garment]
              return choice && <GarmentArt key={garment} garment={garment} outfit={choice} worn />
            })}
          </div>
        </div>
        {equipped.length > 0 && <section className={ui('dress-wearing')} aria-label="Clothes you're wearing">
          <h2 className="sr-only text-center text-sm leading-tight sm:not-sr-only">Wearing</h2>
          <div ref={wearing} className="grid gap-0.5 sm:gap-1.5">
            {equipped.map((garment, index) => {
              const choice = outfit[garment]!
              const label = `Take off ${choice.name} ${garmentName(garment, choice)}`
              return <div key={garment} className={ui('dress-worn-tile')}>
                <GarmentArt garment={garment} outfit={choice} />
                <button type="button" className={ui('dress-remove-mark')}
                  aria-label={label} title={label} onClick={() => takeOff(garment, index)}>
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            })}
          </div>
        </section>}
      </div>
      <section className={ui('dress-panel')} aria-label="Outfit choices" aria-busy={loading}>
        <div className={ui('dress-picker')} hidden={finished}>
          <div className={ui('dress-picker-heading')}>
            <h2 id="pajama-category-title" className="text-center [font-size:var(--game-body-size)] leading-tight">{categories[category].label}</h2>
            <div className="grid auto-cols-fr grid-flow-col gap-1" role="group" aria-label="Clothing categories">
              {categoryNames.map(name => (
                <button key={name} type="button" className={ui('dress-category')}
                  aria-pressed={category === name} aria-controls="pajama-options" onClick={() => {
                    setCategory(name)
                    options.current?.scrollTo({ top: 0 })
                  }}>
                  <span className={ui('dress-category-icon')}>
                    <img src={categoryPreviews[name]} alt="" className="size-full min-h-0 min-w-0 object-contain" />
                  </span>
                  {categories[name].category}
                </button>
              ))}
            </div>
          </div>
          <div id="pajama-options" ref={options} className={ui('dress-options')} data-category={category} role="group" aria-labelledby="pajama-category-title">
            {choices.map(choice => (
              <button key={choice.id} type="button" className={ui('dress-choice')}
                aria-label={`${choice.name} ${category === 'sets' ? categories.sets.item : garmentName(category, choice)}`} aria-pressed={selected === choice}
                disabled={loading} onClick={() => choose(choice)}>
                <WardrobeThumbnail key={category} source={wardrobePreviews[choice.id][category]!} />
                <span className={ui('dress-choice-name')}>{choice.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className={ui('dress-actions')}>
          <button type="button" className={ui('cta cta-dress')}
            disabled={!ready || loading} onClick={() => setFinished(!finished)}>
            {finished ? 'Change outfit' : 'Ready for bed'}
          </button>
          <button type="button" className={ui('dress-shuffle')} hidden={finished} disabled={loading} onClick={shuffle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0" aria-hidden="true">
              <path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 4-3 6-6s4-6 6-6h3m-4-4 4 4-4 4" />
            </svg>
            Shuffle outfits
          </button>
          <p className={ui('dress-load-feedback')} aria-live="polite">
            {loading ? 'Getting your outfit ready…' : selectionError ? 'That outfit didn’t load. Try picking it again.' : ''}
          </p>
        </div>
      </section>
    </div>
  </main>
}

createRoot(document.getElementById('root')!).render(
  <ActivityEntry assets={assets} label="Getting your room ready…" errorMessage="The bedroom couldn’t load. Please try again." night>
    <DressUp />
  </ActivityEntry>,
)
