import { useId } from 'react'
import { ui } from '../ui-classes'
import eggs from '../../assets/pantry/food/eggs.webp'

// Trace the front egg on the pantry sprite so each shell half retains its pencil texture.
const leftShell = 'M136 145 Q151 142 166 144 L158 161 L173 169 L154 187 L167 199 L150 218 L166 228 L148 249 L162 259 L145 291 Q106 291 80 270 Q57 249 66 216 Q75 181 105 159 Q121 148 136 145Z'
const rightShell = 'M166 144 Q198 147 222 171 Q248 198 241 235 Q234 268 201 282 Q176 294 145 291 L162 259 L148 249 L166 228 L150 218 L167 199 L154 187 L173 169 L158 161Z'

export function EggArt({ className, variant }: {
  className: string
  variant: 'whole' | 'opening' | 'shelf-pair'
}) {
  const id = useId()
  const pair = variant === 'shelf-pair'
  const opening = variant === 'opening'
  const image = <image href={eggs} width="384" height="320" />

  return <svg className={className} viewBox={pair ? '0 0 384 320' : '59 138 188 159'}
    preserveAspectRatio={pair ? 'xMidYMax meet' : undefined}
    role={pair ? 'img' : undefined} aria-label={pair ? 'Two eggs left' : undefined} aria-hidden={pair ? undefined : true}>
    <defs>
      <clipPath id={id}>
        <path d={leftShell} />
        <path d={rightShell} />
      </clipPath>
      {opening && <>
        <clipPath id={`${id}-left`}><path d={leftShell} /></clipPath>
        <clipPath id={`${id}-right`}><path d={rightShell} /></clipPath>
      </>}
    </defs>
    {pair ? <>
      <g transform="translate(130 198) rotate(-47) translate(-152 -218)" className="brightness-105">
        <g clipPath={`url(#${id})`}>{image}</g>
      </g>
      <g transform="translate(249 205) rotate(48) translate(-152 -218)" className="brightness-[.89] saturate-[1.3]">
        <g clipPath={`url(#${id})`}>{image}</g>
      </g>
    </> : opening ? <>
      <g className={ui('fried-rice-egg-half')} clipPath={`url(#${id}-left)`}>{image}</g>
      <g className={ui('fried-rice-egg-half')} data-side="right" clipPath={`url(#${id}-right)`}>{image}</g>
    </> : <g clipPath={`url(#${id})`}>{image}</g>}
  </svg>
}
