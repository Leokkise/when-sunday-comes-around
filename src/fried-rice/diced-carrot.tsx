import type { CSSProperties, Ref } from 'react'
import { ui } from '../ui-classes'
import rawDice from '../../assets/fried-rice/food/diced-carrot.webp'
import softenedDice from '../../assets/fried-rice/food/softened-carrot.webp'

export const dicedCarrotArt = { raw: rawDice, softened: softenedDice }

const clusters = [
  { x: 25, y: 38, width: 44, angle: -8, travel: 36, lag: 155 },
  { x: 64, y: 32, width: 46, angle: 12, travel: 50, lag: 125 },
  { x: 34, y: 68, width: 43, angle: 7, travel: 30, lag: 180 },
  { x: 76, y: 65, width: 43, angle: -16, travel: 28, lag: 205 },
]

export function DicedCarrot({ className, style, ref, label, arriving, doneness = 0, stirOffset = 0, stirring = false }: {
  className: string
  style?: CSSProperties
  ref?: Ref<HTMLSpanElement>
  label?: string
  arriving?: boolean
  doneness?: number
  stirOffset?: number
  stirring?: boolean
}) {
  const base = doneness === 1 && !stirring ? softenedDice : rawDice
  return <span ref={ref} className={ui(`${className} grid place-items-center`)} role={label ? 'img' : undefined}
    aria-label={label} aria-hidden={label ? undefined : true} data-arriving={arriving || undefined}
    style={{ ...style, '--fried-rice-carrot-doneness': doneness } as CSSProperties}>
    <span className="relative block aspect-[240/149] h-full max-w-full">
      {clusters.map(cluster => <span key={cluster.x} className={ui('fried-rice-dice-cluster')} style={{
        left: `${cluster.x}%`, top: `${cluster.y}%`, width: `${cluster.width}%`,
        '--fried-rice-dice-x': `${stirOffset * cluster.travel - 50}%`,
        '--fried-rice-dice-turn': `${cluster.angle + stirOffset * 24}deg`,
        '--fried-rice-dice-lag': `${cluster.lag}ms`,
      } as CSSProperties}>
        <img src={base} alt="" className="block w-full" />
        {stirring && <img src={softenedDice} alt="" className={ui('fried-rice-sweep-texture')} />}
      </span>)}
    </span>
  </span>
}
