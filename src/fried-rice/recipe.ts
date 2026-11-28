import pan from '../../assets/fried-rice/tools/pan.webp'
import spatula from '../../assets/fried-rice/tools/spatula.webp'
import oil from '../../assets/fried-rice/tools/oil.webp'
import plate from '../../assets/fried-rice/tools/plate.webp'
import board from '../../assets/fried-rice/tools/cutting-board.webp'
import knife from '../../assets/fried-rice/tools/knife.webp'
import salt from '../../assets/fried-rice/tools/salt.webp'
import pepper from '../../assets/fried-rice/tools/pepper.webp'
import rice from '../../assets/pantry/food/rice.webp'
import eggs from '../../assets/pantry/food/eggs.webp'
import carrots from '../../assets/fried-rice/food/leafy-carrot.webp'
import milk from '../../assets/pantry/food/milk.webp'
import apples from '../../assets/pantry/food/apple.webp'
import broccoli from '../../assets/pantry/food/broccoli.webp'
import tomatoes from '../../assets/pantry/food/tomatoes.webp'
import corn from '../../assets/pantry/food/corn.webp'
import { carrotCuts } from './carrot-cuts'

export const supplies = {
  pan: { label: 'Pan', image: pan },
  spatula: { label: 'Spatula', image: spatula },
  oil: { label: 'Cooking oil', image: oil },
  plate: { label: 'Plate', image: plate },
  board: { label: 'Cutting board', image: board },
  knife: { label: 'Knife', image: knife },
  salt: { label: 'Salt', image: salt },
  pepper: { label: 'Pepper', image: pepper },
  rice: { label: 'Cooked rice', image: rice },
  eggs: { label: 'Egg', image: eggs },
  carrots: { label: 'Carrot', image: carrots },
  milk: { label: 'Milk', image: milk },
  apples: { label: 'Apples', image: apples },
  broccoli: { label: 'Broccoli', image: broccoli },
  tomatoes: { label: 'Tomatoes', image: tomatoes },
  corn: { label: 'Corn', image: corn },
} as const

export type Supply = keyof typeof supplies

export const storage = {
  tools: { label: 'Left cupboard', shelves: [['board', 'knife'], ['pan', 'plate']] },
  dishes: { label: 'Right cupboard', shelves: [['oil', 'spatula'], ['salt', 'pepper']] },
  fridge: { label: 'Fridge', shelves: [['carrots', 'broccoli', 'tomatoes'], ['eggs', 'rice'], ['milk', 'apples', 'corn']] },
} as const satisfies Record<string, { label: string; shelves: readonly (readonly Supply[])[] }>

export type Storage = keyof typeof storage

export const recipe = [
  { title: 'Get the cutting board', area: 'tools', item: 'board' },
  { title: 'Get the knife', area: 'tools', item: 'knife' },
  { title: 'Get the carrot', area: 'fridge', item: 'carrots' },
  { title: 'Chop the carrot', action: 'chop', taps: carrotCuts.length, instruction: 'Pick up the knife beside the board.' },
  { title: 'Get the pan', area: 'tools', item: 'pan' },
  { title: 'Find the oil', area: 'dishes', item: 'oil' },
  { title: 'Add a little oil', instruction: 'Tap the pan to pour a little oil.', action: 'oil' },
  { title: 'Warm the oil', instruction: 'Tap the cooker dial to turn it on.', action: 'heat' },
  { title: 'Add the carrot', instruction: 'Tap the chopped carrot to pick it up.', action: 'carrots' },
  { title: 'Get the spatula', area: 'dishes', item: 'spatula' },
  { title: 'Soften the carrot', action: 'soften', taps: 8, instruction: 'Follow the arrow for eight gentle sweeps. Watch the carrot soften.' },
  { title: 'Get an egg', area: 'fridge', item: 'eggs' },
  { title: 'Crack the egg', instruction: 'Tap the egg.', action: 'egg' },
  { title: 'Scramble the egg', action: 'scramble', taps: 3 },
  { title: 'Get the cooked rice', area: 'fridge', item: 'rice' },
  { title: 'Add the rice', instruction: 'Tap the rice bowl.', action: 'rice' },
  { title: 'Mix the fried rice', action: 'mix', taps: 3 },
  { title: 'Get the salt', area: 'dishes', item: 'salt' },
  { title: 'Add a pinch of salt', instruction: 'Tap the salt shaker.', action: 'salt' },
  { title: 'Get the pepper', area: 'dishes', item: 'pepper' },
  { title: 'Add a little pepper', instruction: 'Tap the pepper shaker.', action: 'pepper' },
  { title: 'Get a plate', area: 'tools', item: 'plate' },
  { title: 'Serve it up', instruction: 'Tap the plate.', action: 'serve' },
] as const satisfies readonly ({ title: string } & (
  { area: Storage; item: Supply } | ({ action: string; instruction?: string } & ({ taps: number } | { instruction: string }))
))[]

export type CookingAction = Extract<typeof recipe[number], { action: string }>['action']

export function stepKey(step: (typeof recipe)[number] | undefined) {
  if (!step) return 'finished'
  return 'item' in step ? `get:${step.item}` : `cook:${step.action}`
}

const groupStarts = [
  { title: 'Set up the cutting board', step: 'get:board' },
  { title: 'Chop the carrot', step: 'cook:chop' },
  { title: 'Set up the pan and warm the oil', step: 'get:pan' },
  { title: 'Add and soften the carrot', step: 'cook:carrots', until: 'get:eggs' },
  { title: 'Sweep the carrot', step: 'cook:soften' },
  { title: 'Cook the egg', step: 'get:eggs' },
  { title: 'Add and mix the rice', step: 'get:rice' },
  { title: 'Season the rice', step: 'get:salt' },
  { title: 'Serve the rice', step: 'get:plate' },
] as const

const groupIndexes = groupStarts.map(group => recipe.findIndex(step => stepKey(step) === group.step))
export const recipeGroups = groupStarts.map((group, index) => ({
  ...group,
  start: groupIndexes[index],
  end: 'until' in group ? recipe.findIndex(step => stepKey(step) === group.until) : groupIndexes[index + 1] ?? recipe.length,
}))

export type RecipeGroup = (typeof recipeGroups)[number]
