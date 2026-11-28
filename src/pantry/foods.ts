const images = import.meta.glob<string>('../../assets/pantry/food/*.webp', { eager: true, query: '?url', import: 'default' })

export const groups = [
  { id: 'go', name: 'Go', clue: 'Energy for play' },
  { id: 'grow', name: 'Grow', clue: 'Builds muscles' },
  { id: 'glow', name: 'Glow', clue: 'Fruits & veggies' },
] as const

type FoodGroup = typeof groups[number]['name']
type FoodEntry = [id: string, name: string, group: FoodGroup, tip: string]

const entries: FoodEntry[] = [
  ['rice', 'Rice', 'Go', 'Think about what helps you keep running at recess.'],
  ['bread', 'Bread', 'Go', 'What helps you keep moving when you play?'],
  ['corn', 'Corn', 'Go', 'Think about what fuels your legs on a long walk.'],
  ['potatoes', 'Potatoes', 'Go', 'Think about what helps you keep playing after lunch.'],
  ['pancakes', 'Pancakes', 'Go', 'What helps you get moving after breakfast?'],
  ['eggs', 'Eggs', 'Grow', 'Think about what helps you build strong arms.'],
  ['fish', 'Fish', 'Grow', 'What helps your body fix tired muscles after play?'],
  ['chicken', 'Chicken', 'Grow', 'What helps your body get stronger as you get bigger?'],
  ['beef', 'Beef', 'Grow', 'Think about what helps your muscles when you climb.'],
  ['milk', 'Milk', 'Grow', 'Think about what helps your bones get stronger.'],
  ['carrot', 'Carrots', 'Glow', 'Think about what helps your eyes do their job.'],
  ['apple', 'Apples', 'Glow', 'Think about what helps your tummy do its job.'],
  ['broccoli', 'Broccoli', 'Glow', 'Think about what this green veggie does to help you stay well.'],
  ['bananas', 'Bananas', 'Glow', 'Think about what this fruit does for your tummy.'],
  ['tomatoes', 'Tomatoes', 'Glow', 'Think about what helps your body stay well.'],
]

export const foods = entries.map(([id, name, group, tip]) => ({
  id, name, group, tip, image: images[`../../assets/pantry/food/${id}.webp`],
}))

export type Food = typeof foods[number]

export function makeOrder() {
  const items = [...foods]
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}
