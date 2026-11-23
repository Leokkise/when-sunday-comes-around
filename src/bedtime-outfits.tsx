import accessory0 from '../assets/bedtime/starry-mask.webp'
import accessory1 from '../assets/bedtime/midnight-mask.webp'
import accessory2 from '../assets/bedtime/bunny-mask.webp'
import accessory3 from '../assets/bedtime/pink-cat-mask.webp'
import accessory4 from '../assets/bedtime/starry-cap.webp'
import accessory5 from '../assets/bedtime/bunny-hat.webp'
import accessory6 from '../assets/bedtime/blue-cat-hat.webp'
import cloudBlueAtlas from '../assets/bedtime/blue-classic.webp'
import sleepyCatAtlas from '../assets/bedtime/cat.webp'
import cherryChecksAtlas from '../assets/bedtime/cherry-gingham.webp'
import dinosaurAtlas from '../assets/bedtime/dinosaur.webp'
import mushroomChecksAtlas from '../assets/bedtime/mushroom-gingham.webp'
import cherryChecksMask from '../assets/bedtime/cherry-gingham-mask.avif'
import mushroomChecksMask from '../assets/bedtime/mushroom-gingham-mask.avif'
import moonlightPlaidAtlas from '../assets/bedtime/moonlight-plaid.webp'
import fairIsleAtlas from '../assets/bedtime/fair-isle.webp'
import yarnCatAtlas from '../assets/bedtime/yarn-cat.webp'
import cocoaPuppyAtlas from '../assets/bedtime/cocoa-puppy.webp'
import yarnCatMask from '../assets/bedtime/yarn-cat-mask.webp'
import cocoaPuppyMask from '../assets/bedtime/cocoa-puppy-mask.webp'

const cellWidth = 256
const cellHeight = 320

export type Garment = keyof typeof garments
type Bounds = readonly [x: number, y: number, width: number, height: number]
export type BedtimeOutfit = {
  id: string
  name: string
  atlas?: string
  maskArt?: string
  headwearArt?: string
  parts: readonly Garment[]
  fit?: Partial<Record<Garment, Bounds>>
  hoodLining?: string
  coversArms?: boolean
}

// Cells and bounds use the same coordinate system as the 900 × 1350 character.
export const garments = {
  top: { label: 'Pajama tops', category: 'Tops', item: 'pajama top', cell: 0, bounds: [278, 362, 344, 396] },
  pants: { label: 'Pajama pants', category: 'Pants', item: 'pajama pants', cell: 1, bounds: [328, 651, 244, 596] },
  headwear: { label: 'Hats & hoods', category: 'Hats & hoods', item: 'nightcap', cell: 2, bounds: [274, 4, 409, 269] },
  mask: { label: 'Sleep masks', category: 'Sleep masks', item: 'sleep mask', cell: 3, bounds: [312, 196, 275, 99] },
  socks: { label: 'Cozy socks', category: 'Socks', item: 'socks', cell: 4, bounds: [310, 1185, 281, 164] },
} as const satisfies Record<string, { label: string; category: string; item: string; cell: number; bounds: Bounds }>

const roomierTop: Bounds = [264, 357, 372, 435]
const referenceFit = { top: [282, 366, 336, 394], pants: [333, 650, 234, 598], socks: [320, 1193, 260, 150] } as const
const pajamas = ['top', 'pants', 'socks'] as const
const maskedPajamas = [...pajamas, 'mask'] as const
const hoodedPajamas = [...pajamas, 'headwear'] as const
const checkedPajamas = [...hoodedPajamas, 'mask'] as const

export const bedtimeOutfits: readonly BedtimeOutfit[] = [
  {
    id: 'dinosaur', name: 'Little Dinosaur', atlas: dinosaurAtlas, parts: hoodedPajamas, hoodLining: '#50573c',
    fit: { top: [283, 369, 334, 395], pants: [305, 650, 263, 604], headwear: [231, 2, 400, 416], socks: [320, 1197, 260, 143] },
  },
  {
    id: 'blue-classic', name: 'Cloud Blue', atlas: cloudBlueAtlas, parts: pajamas,
    fit: { top: roomierTop, pants: [338, 651, 224, 596] },
  },
  {
    id: 'cat', name: 'Sleepy Cat', atlas: sleepyCatAtlas, parts: hoodedPajamas, hoodLining: '#565a6c',
    fit: { pants: [321, 651, 258, 603], headwear: [250, 2, 400, 416], socks: [320, 1184, 260, 154] },
  },
  {
    id: 'cherry-gingham', name: 'Cherry Checks', atlas: cherryChecksAtlas, maskArt: cherryChecksMask, parts: checkedPajamas,
    fit: { top: roomierTop },
  },
  {
    id: 'mushroom-gingham', name: 'Mushroom Checks', atlas: mushroomChecksAtlas, maskArt: mushroomChecksMask, parts: checkedPajamas,
    fit: { top: roomierTop, pants: [336, 651, 228, 596] },
  },
  {
    id: 'moonlight-plaid', name: 'Moonlight Plaid', atlas: moonlightPlaidAtlas, parts: pajamas,
    fit: { ...referenceFit, top: [294, 358, 312, 376] }, coversArms: true,
  },
  {
    id: 'fair-isle', name: 'Cozy Fair Isle', atlas: fairIsleAtlas, parts: pajamas,
    fit: { ...referenceFit, top: [266, 345, 368, 415], socks: [308, 1183, 284, 164] },
  },
  {
    id: 'yarn-cat', name: 'Yarn Cat', atlas: yarnCatAtlas, maskArt: yarnCatMask, parts: maskedPajamas,
    fit: { ...referenceFit, top: [289, 335, 322, 399], socks: [308, 1183, 284, 164] }, coversArms: true,
  },
  {
    id: 'cocoa-puppy', name: 'Cocoa Puppy', atlas: cocoaPuppyAtlas, maskArt: cocoaPuppyMask, parts: maskedPajamas,
    fit: { ...referenceFit, top: [289, 338, 322, 396], pants: [325, 650, 250, 598] }, coversArms: true,
  },
]

export function garmentName(garment: Garment, outfit: BedtimeOutfit) {
  return garment === 'headwear' && outfit.hoodLining ? 'hood' : garments[garment].item
}

export const bedtimeChoices: readonly BedtimeOutfit[] = [...bedtimeOutfits,
  { id: 'starry-mask', name: 'Starry Night', parts: ['mask'], maskArt: accessory0 },
  { id: 'midnight-mask', name: 'Midnight', parts: ['mask'], maskArt: accessory1 },
  { id: 'bunny-mask', name: 'Bunny Dreams', parts: ['mask'], maskArt: accessory2, fit: { 'mask': [312, 100, 275, 200] } },
  { id: 'pink-cat-mask', name: 'Pink Cat', parts: ['mask'], maskArt: accessory3, fit: { 'mask': [312, 170, 275, 130] } },
  { id: 'starry-cap', name: 'Starry Night', parts: ['headwear'], headwearArt: accessory4, fit: { 'headwear': [250, 0, 420, 380] } },
  { id: 'bunny-hat', name: 'Bunny Dreams', parts: ['headwear'], headwearArt: accessory5, fit: { 'headwear': [210, 0, 480, 480] } },
  { id: 'blue-cat-hat', name: 'Blue Cat', parts: ['headwear'], headwearArt: accessory6, fit: { 'headwear': [285, 0, 330, 212] } },
]
export const outfitAssets = bedtimeChoices.flatMap(({ atlas, maskArt, headwearArt }) =>
  [atlas, maskArt, headwearArt].filter((src): src is string => Boolean(src)))

function AtlasPiece({ outfit, garment, bounds }: { outfit: BedtimeOutfit; garment: Garment; bounds: Bounds }) {
  const [x, y, width, height] = bounds
  const separateArt = garment === 'mask' ? outfit.maskArt : garment === 'headwear' ? outfit.headwearArt : undefined
  if (separateArt) {
    return <image href={separateArt} x={x} y={y} width={width} height={height} preserveAspectRatio="xMidYMid meet" />
  }
  const { cell } = garments[garment]
  const column = cell % 3
  const row = Math.floor(cell / 3)

  return <svg x={x} y={y} width={width} height={height} overflow="hidden" preserveAspectRatio="none"
    viewBox={`${column * cellWidth} ${row * cellHeight} ${cellWidth} ${cellHeight}`}>
    <image href={outfit.atlas} width={cellWidth * 3} height={cellHeight * 2} />
  </svg>
}

export function GarmentArt({ garment, outfit, worn = false }: { garment: Garment; outfit: BedtimeOutfit; worn?: boolean }) {
  const bounds = outfit.fit?.[garment] ?? garments[garment].bounds

  return <svg viewBox={worn ? '0 0 900 1350' : bounds.join(' ')}
    className={worn ? 'pointer-events-none absolute inset-0 size-full' : 'size-full'}
    data-garment={worn ? garment : undefined} aria-hidden="true">
    <AtlasPiece outfit={outfit} garment={garment} bounds={bounds} />
  </svg>
}

export function SetArt({ outfit }: { outfit: BedtimeOutfit }) {
  const hasHeadwear = outfit.parts.includes('headwear')
  const headwear: Bounds = outfit.hoodLining ? [30, 0, 76, 79] : [21, 6, 108, 71]
  return <svg viewBox={hasHeadwear ? '0 0 260 312' : '0 55 260 257'} className="size-full" aria-hidden="true">
    {hasHeadwear && <AtlasPiece outfit={outfit} garment="headwear" bounds={headwear} />}
    <AtlasPiece outfit={outfit} garment="top" bounds={[3, 78, 135, 152]} />
    <AtlasPiece outfit={outfit} garment="pants" bounds={[156, 58, 98, 209]} />
    {outfit.parts.includes('mask') && <AtlasPiece outfit={outfit} garment="mask" bounds={[24, 252, 92, 33]} />}
    <AtlasPiece outfit={outfit} garment="socks" bounds={[164, 271, 81, 41]} />
  </svg>
}
