import { ui } from './ui-classes'
import { StaggeredGlints } from './character-shine'
import { sectionForTooth, toothAt, toothBounds, toothCenters } from './brush-sections'

export const frontArt = '/brush/brush-pencil-slim-laterals.webp'
export const brushedEnamelOpacity = .32
const rinsedEnamelOpacity = .64

export function EnamelMask({ id, width, height }: { id: string; width: number; height: number }) {
  const filterId = id + '-alpha'
  return <>
    <filter id={filterId} colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 8 2 0 -7.05" />
      <feComposite in2="SourceGraphic" operator="in" />
    </filter>
    <mask id={id} maskUnits="userSpaceOnUse" width={width} height={height} x="0" y="0" className="[mask-type:alpha]">
      <image href={frontArt} width={width} height={height} preserveAspectRatio="none" filter={`url(#${filterId})`} />
    </mask>
  </>
}

export function ToothRowShine({ upper }: { upper: boolean }) {
  const centers = upper ? toothCenters.upper : toothCenters.lower
  const spots = centers.map((x, tooth) => {
    const y = upper ? 42 : tooth === 0 || tooth === centers.length - 1 ? 61 : 64
    return { x, y, spread: [1.6, 4] as [number, number] }
  })
  return <StaggeredGlints spots={spots} className="brush-tooth-shine" />
}

const latherEdge = 'M-11 .4Q-11-1-9.4-1Q-8.8-2.3-7.1-1.6Q-6-2.8-4.2-1.9Q-2.6-3.2-.3-2.2Q1.2-3 2.7-2Q4.6-2.6 5.7-1.4Q7.4-2.2 8.6-1Q11-1 11 .5Q10.6 2.1 8.8 2Q7.8 3.8 6 3Q5.3 5.8 3.8 6.2Q2.5 6 2.4 3.4Q1.6 2.8.4 3.6Q-1 4.1-2.4 2.7Q-3.6 2.4-4.2 3.9Q-4.7 5.2-6 4.7Q-7 4.2-7 2.6Q-7.9 1.9-9 2.3Q-10.5 2.2-11 .4Z'
const latherPile = 'M-12-1Q-12-3-9-3.6Q-8-5.5-5-4.5Q-2-6.2 1-4.9Q3-5.7 5-4.6Q8-5.1 9-3.1Q12-3 12 .4Q11.8 3.3 9 3.2Q8 5.3 6 4.2Q4.6 4.1 3.9 5.8Q2.6 7.7 1 6.5Q-.1 5.7-.1 4.4Q-2 3.4-3.6 4.4Q-6.3 5.4-7.1 3.7Q-9.4 4.1-10.1 2Q-12.4 1.4-12-1Z'
const foamPores = [[.4, .6, .15], [1.1, 1.4, .34], [2, .65, .25], [2.9, 1, .13], [3.6, .55, .34], [4.5, 1.1, .22], [5.4, .45, .16],
  [.5, 2.2, .38], [1.7, 2.6, .17], [2.5, 2, .43], [3.35, 2.35, .19], [4.2, 2.1, .3], [5.3, 2.5, .42], [5.75, 1.55, .12]]

export function ToothpasteFoam({ spots }: {
  spots: { x: number; y: number; level: number; lower: boolean; widthScale: number; pileY: number }[]
}) {
  return <svg className={ui("brush-foam")} viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <path id="brush-lather-edge" d={latherEdge} />
      <path id="brush-lather-pile" d={latherPile} />
      <linearGradient id="brush-lather-color" x2="0" y2="1">
        <stop stopColor="#fffdf5" stopOpacity=".76" />
        <stop offset=".46" stopColor="#fffdf5" stopOpacity=".96" />
        <stop offset="1" stopColor="#edf3e8" stopOpacity=".58" />
      </linearGradient>
      <radialGradient id="brush-lather-body" cx=".48" cy=".44" r=".64">
        <stop stopColor="#fffefa" stopOpacity=".99" />
        <stop offset=".62" stopColor="#fffefa" stopOpacity=".96" />
        <stop offset="1" stopColor="#ebf0e7" stopOpacity=".62" />
      </radialGradient>
      <filter id="brush-lather-soft-edge">
        <feGaussianBlur stdDeviation=".55" />
      </filter>
      <pattern id="brush-lather-pores" width="6" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
        {foamPores.map(([cx, cy, r]) => (
          <circle key={cx} cx={cx} cy={cy} r={r} fill="#b1aaa1" fillOpacity=".30" stroke="#fffefa" strokeWidth=".14" />
        ))}
      </pattern>
    </defs>
    <g>
      {spots.map(({ x, y, level, lower, widthScale }, index) => (
        <g key={`${x}-${y}`} opacity={Math.min(.75, level * 1.15)}
          transform={`translate(${x} ${y / 2}) scale(${widthScale * (index % 2 ? -1 : 1)} ${lower ? -1 : 1})`}>
          <use href="#brush-lather-edge" fill="url(#brush-lather-color)" />
          <use href="#brush-lather-edge" fill="url(#brush-lather-pores)" />
          <g fill="#fffdf5" stroke="#cfcec0" strokeWidth=".13">
            <circle cx="-5.2" cy="5.4" r=".53" />
            <circle cx="3.96" cy="6.8" r=".35" />
            <circle cx="7.7" cy="3.2" r=".67" />
          </g>
        </g>
      ))}
      {spots.map(({ x, level, pileY, widthScale }, index) => (
        <g key={`pile-${x}-${pileY}`} opacity={Math.min(1, Math.max(0, level * 1.65 - .4))}
          transform={`translate(${x} ${pileY / 2}) scale(${widthScale * (index % 2 ? -1 : 1)} ${.73 + index % 3 * .12})`}>
          <use href="#brush-lather-pile" fill="#fffdf5" opacity=".6" filter="url(#brush-lather-soft-edge)" />
          <use href="#brush-lather-pile" fill="url(#brush-lather-body)" />
          <use href="#brush-lather-pile" fill="url(#brush-lather-pores)" opacity=".7" />
        </g>
      ))}
    </g>
  </svg>
}

const frontRegions = [true, false].flatMap(upper => {
  const columns = upper ? toothBounds.upper : toothBounds.lower
  return columns.slice(0, -1).map((x, index) => {
    const split = sectionForTooth(index) === 1 ? 54.5 : 53
    return { x, y: upper ? 26 : split, width: columns[index + 1] - x, height: upper ? split - 26 : 79 - split, upper, index }
  })
})
const frontCrumbs = [
  [[7, 46], [13, 43], [19, 46], [24, 44], [31, 42], [36, 48], [42, 45], [47, 40], [54, 44], [58, 49], [64, 43], [70, 44], [76, 48], [81, 44], [86, 46], [93, 43]],
  [[8, 61], [14, 63], [21, 65], [27, 62], [29, 69], [34, 65], [40, 65], [46, 70], [53, 63], [56, 71], [60, 66], [66, 65], [72, 68], [77, 63], [84, 64], [91, 61]],
].flatMap((row, index) => row.map(([x, y]) => ({ x, y, upper: index === 0 })))

export function ToothCoating({ step, progress, rinsed }: { step: number; progress: number[]; rinsed: boolean }) {
  function remaining(upper: boolean, index: number) {
    const round = upper ? 1 : 2
    return step < round ? 1 : step > round ? 0 : 1 - (progress[index] ?? 0)
  }

  function renderCoating() {
    return <g mask="url(#brush-enamel-mask)">
      {frontRegions.map(({ x, y, width, height, upper, index }) => {
        const buildup = remaining(upper, index)
        const bounds = { x: `${x}%`, y: `${y}%`, width: `${width}%`, height: `${height}%` }
        return <g key={`${x}-${y}`}>
          <rect {...bounds} fill="#c4a03d" opacity={buildup * .32} />
          <rect {...bounds} fill="#fff" opacity={(rinsed ? rinsedEnamelOpacity : brushedEnamelOpacity) * (1 - buildup)} />
        </g>
      })}
      {frontCrumbs.map((crumb, index) => {
        const tooth = toothAt(crumb.x, crumb.upper)
        return <g key={index} className={ui("brush-food-piece")} data-food={['meat', 'leaf', 'seed', 'snack'][index % 4]}
          transform={`translate(${crumb.x * 17.52} ${crumb.y * 9.12}) rotate(${index % 2 ? -22 : 18}) scale(1.45)`} opacity={remaining(crumb.upper, tooth)}>
          {index % 4 === 0 && <g fill="none" strokeLinecap="round"><path d="M-7-11Q1-4-4 12M-1-12Q7-3 2 11M5-9Q11 0 7 9" stroke="#a76e52" strokeWidth="3" /><path d="M-4-9Q3 0-1 9" stroke="#d3a17d" strokeWidth="1.5" /></g>}
          {index % 4 === 1 && <g><path d="M-10 5Q-14-8 1-12Q14-5 9 7L1 12Z" fill="#71864e" stroke="#52683c" strokeWidth="1.5" /><path d="M-4 8 5-7M0 2-6-2M2-2 8-1" fill="none" stroke="#a4ae73" strokeWidth="1.4" /></g>}
          {index % 4 === 2 && <g><ellipse rx="5" ry="9" fill="#9c7847" stroke="#705836" strokeWidth="1.5" /><path d="M-1-5Q2 0-1 5" fill="none" stroke="#d8bd87" strokeWidth="1.5" /></g>}
          {index % 4 === 3 && <g><path d="M-10-5Q-5-12 2-8Q13-10 12 0Q16 9 5 9Q-4 14-9 7Q-15 4-10-5Z" fill="#bd9156" stroke="#987342" strokeWidth="1.5" /><path d="M-5-3 0-5M4 3 7 2" stroke="#e1bb79" strokeWidth="2" strokeLinecap="round" /></g>}
        </g>
      })}
    </g>
  }

  return <svg className={ui("brush-tooth-coating")} viewBox="0 0 1752 912" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <EnamelMask id="brush-enamel-mask" width={1752} height={912} />
    </defs>
    {renderCoating()}
  </svg>
}
