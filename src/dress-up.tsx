import { useId, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ActivityEntry } from './activity-loading'
import { BathBandages, SmilingCharacterArt, bathSprite, brushFinishMouth } from './bath-scene'
import { bedtimeChoices, bedtimeOutfits, GarmentArt, garmentName, garments, outfitAssets, SetArt, type BedtimeOutfit, type Garment } from './bedtime-outfits'
import { InkFilters } from './ink-filters'
import { ui } from './ui-classes'

const bedroom = '/pajama-bedroom.webp'
const assets = [bedroom, bathSprite, brushFinishMouth, '/bath-supplies.webp', ...outfitAssets]

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
  return <svg className="absolute size-0" width="0" height="0" aria-hidden="true">
    <mask id={id} maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
      <rect width="1" height="1" fill="white" />
      <g transform="scale(.001111111 .000740741)" fill="black">
        {outfit.headwear?.hoodLining && <rect width="900" height="65" />}
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
  const options = useRef<HTMLDivElement>(null)
  const bodyMask = useId()
  const ready = Boolean(outfit.top && outfit.pants)
  const worn = layers.flatMap(garment => {
    const choice = outfit[garment]
    return choice ? [`${choice.name} ${garmentName(garment, choice)}`] : []
  })
  const selected = category === 'sets'
    ? bedtimeOutfits.find(choice => matchesSet(outfit, choice))
    : outfit[category]
  const choices = category === 'sets' ? bedtimeOutfits : bedtimeChoices.filter(choice => choice.parts.includes(category))
  const coveredBandages = [
    ...(outfit.top ? ['right shoulder', 'left forearm'] : []),
    ...(outfit.pants ? ['right knee', 'left shin'] : []),
  ]

  function choose(choice: BedtimeOutfit) {
    setOutfit(previous => {
      if (category === 'sets') {
        return matchesSet(previous, choice)
          ? {} : Object.fromEntries(choice.parts.map(garment => [garment, choice]))
      }
      return { ...previous, [category]: previous[category] === choice ? undefined : choice }
    })
  }

  return <main className={ui('dress-page activity-type')}>
    <InkFilters />
    <a href="/brush-teeth/" className={ui('wash-back')} aria-label="Back to Brush Teeth">
      <svg className={ui('ink-wiggle')} viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <path d="M29 18c-5 1-14 0-22 0m0 0 8-8m-8 8 8 8" />
      </svg>
    </a>
    <div className={ui('dress-layout')}>
      <header className="lg:col-start-2 lg:row-start-1 lg:self-start">
        <h1 className={ui('ink-wiggle [font-size:clamp(2rem,calc(1.4rem_+_2.5vw),3.375rem)]')}>Bedtime!</h1>
        <p className={finished ? 'mt-2 [font-size:var(--game-body-size)] leading-snug' : 'sr-only'} role="status">
          {finished && 'Snug and ready for bed. Good night!'}
        </p>
      </header>
      <div className={ui('dress-preview')} role="img" aria-label={worn.length
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
      <section className={ui('dress-panel')} aria-label="Outfit choices">
        <div className={ui('dress-picker')} hidden={finished}>
          <h2 id="pajama-category-title" className="shrink-0 text-center [font-size:var(--game-body-size)] leading-tight">{categories[category].label}</h2>
          <div className="grid shrink-0 auto-cols-fr grid-flow-col gap-1 border-b border-[#cbbfae] pb-3" role="group" aria-label="Clothing categories">
            {categoryNames.map(name => (
              <button key={name} type="button" className={ui('dress-category')}
                aria-pressed={category === name} aria-controls="pajama-options" onClick={() => {
                  setCategory(name)
                  options.current?.scrollTo({ top: 0 })
                }}>
                <span className={ui('dress-category-icon')}>
                  {name === 'sets' ? <SetArt outfit={bedtimeOutfits[0]} />
                    : <GarmentArt garment={name} outfit={outfit[name] ?? bedtimeChoices.find(choice => choice.parts.includes(name))!} />}
                </span>
                {categories[name].category}
              </button>
            ))}
          </div>
          <div id="pajama-options" ref={options} className={ui('dress-options')} data-category={category} role="group" aria-labelledby="pajama-category-title">
            {choices.map(choice => (
              <button key={choice.id} type="button" className={ui('dress-choice')}
                aria-label={`${choice.name} ${category === 'sets' ? categories.sets.item : garmentName(category, choice)}`} aria-pressed={selected === choice}
                onClick={() => choose(choice)}>
                <span className={ui('dress-thumbnail')}>
                  {category === 'sets' ? <SetArt outfit={choice} /> : <GarmentArt garment={category} outfit={choice} />}
                </span>
                <span className="block py-1">{choice.name}</span>
              </button>
            ))}
          </div>
        </div>
        <button type="button" className={ui('cta cta-dress mt-auto shrink-0')}
          disabled={!ready} onClick={() => setFinished(!finished)}>
          {finished ? 'Change outfit' : 'Ready for bed'}
        </button>
      </section>
    </div>
  </main>
}

createRoot(document.getElementById('root')!).render(
  <ActivityEntry assets={assets} label="Getting your room ready…" errorMessage="The bedroom couldn’t load. Please try again." night>
    <DressUp />
  </ActivityEntry>,
)
