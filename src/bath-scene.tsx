import { BodyShine, HairShine } from './character-shine'
import { ui } from './ui-classes'

export const bathSprite = '/bath-sprite.webp'
export const brushFinishMouth = '/brush-finish-mouth.png'

export const bathTools = [
  { name: 'Shampoo', x: 75.3, y: 22.2, width: 8, height: 12 },
  { name: 'Sponge', x: 87.9, y: 25, width: 8, height: 6 },
  { name: 'Soap', x: 81.7, y: 25.7, width: 6, height: 5 },
  { name: 'Shower', x: 16, y: 30.5, width: 24, height: 50 },
  { name: 'Bandage', x: 19, y: 66.8, width: 12, height: 7 },
  { name: 'Towel', x: 85, y: 44.5, width: 16, height: 17 },
] as const

export const bathScrapes = [
  { name: 'right knee', x: 56, y: 74, angle: -30 },
  { name: 'left forearm', x: 36.5, y: 51, angle: -38 },
  { name: 'left shin', x: 44, y: 77, angle: -29 },
  { name: 'right shoulder', x: 59.5, y: 32, angle: -36 },
]

export function ToolArt({ tool }: { tool: typeof bathTools[number] }) {
  return <i className={ui('wash-supply-art wash-supply-' + tool.name.toLowerCase())} aria-hidden="true" />
}

export function BathSupplies({ selected, wrong, disabled, onSelect }: {
  selected?: typeof bathTools[number]['name']
  wrong?: boolean
  disabled?: boolean
  onSelect?: (tool: typeof bathTools[number]['name']) => void
}) {
  return <div className={ui('wash-props')} role={onSelect ? 'group' : undefined}
    aria-label={onSelect ? 'Bath supplies' : undefined} aria-hidden={!onSelect || undefined}>
    {bathTools.map(item => {
      const style = { left: item.x + '%', top: item.y + '%', width: item.width + '%', height: item.height + '%' }
      return onSelect
        ? <button className={ui('wash-prop')} key={item.name} type="button" aria-label={item.name}
          aria-pressed={selected === item.name} disabled={disabled} onClick={() => onSelect(item.name)} style={style}>
          <ToolArt tool={item} />
          <span>{item.name}</span>
          {wrong && selected === item.name && <b className={ui('activity-tool-x')} aria-hidden="true">×</b>}
        </button>
        : <div className={ui('wash-prop pointer-events-none!')} key={item.name} style={style}><ToolArt tool={item} /></div>
    })}
  </div>
}

export function CleanBathScene({ smile }: { smile?: 'before-brushing' | 'after-brushing' }) {
  return <div className={ui('wash-stage')} role="img"
    aria-label={smile === 'before-brushing' ? 'Your friend smiling, with green wisps showing that it’s time to brush'
      : smile === 'after-brushing' ? 'Your friend smiling with clean teeth after bathing and brushing' : 'Your friend, clean and dry after his bath'}>
    <BathSupplies />
    <div className={ui('wash-character')} aria-hidden="true">
      <img src={bathSprite} alt="" width="1024" height="1536" draggable={false} />
      {smile && <img src={brushFinishMouth} alt="" width="112" height="64" draggable={false}
        className="absolute [left:49.8%] [top:23.02%] w-[4.2%]! -translate-x-1/2 -translate-y-1/2" />}
      {smile === 'before-brushing' && <svg className={ui('brush-breath')} viewBox="0 0 84 42" fill="none" aria-hidden="true">
        <path d="M2 23c18-10 29 1 47-10l6 21C30 35 20 23 2 27Z" fill="#c4d580" opacity=".52" />
        <g stroke="#71894a" strokeLinecap="round">
          <path d="M4 23c13-7 20-3 29-4s12-6 22-6" opacity=".68" />
          <path d="M8 26c10-5 19 1 28 1s12-4 20-5" opacity=".75" />
          <path d="M19 30c12-2 20 5 35 2" opacity=".55" />
        </g>
        <g className="brush-breath-flow" stroke="#fffdf2" strokeWidth="1.8" strokeLinecap="round">
          <path pathLength="1" d="M6 21c13-6 19-3 29-4s13-6 24-6" />
          <path pathLength="1" d="M11 30c11-4 18 3 28 1s13-5 20-5" />
        </g>
        <g className="brush-breath-puff">
          <path d="M49 15q-3-5 3-6-1-5 5-5 3-5 8 0 6-4 9 2 6-1 6 6 6 3 2 9 4 6-2 10 0 6-7 6-4 6-10 1-6 4-10-2-6 1-7-5-5-2-1-7-3-6 4-9Z"
            fill="#faf8de" stroke="#7a8e51" strokeWidth="1.15" />
          <path d="M51 16q-2-5 5-5-1-5 5-3 3-4 6 1 5-2 7 3 5 2 3 7 5 4 0 7 2 6-5 6-3 5-8 1-6 3-8-2-5 1-6-4-4-4 1-11Z" fill="#c5d882" />
          <path d="M55 16q2-3 5-2m6-4q2-2 5 0m1 9q3-2 5 0m-16 8q3-2 5 0m4 5q2 1 4-1" stroke="#fffdf2" strokeWidth="1.6" strokeLinecap="round" />
          <g fill="#82964d" opacity=".7">
            <circle cx="57" cy="21" r="1.1" /><circle cx="65" cy="17" r="1.35" />
            <circle cx="72" cy="25" r="1" /><circle cx="61" cy="32" r=".85" />
          </g>
          <g fill="#fffdf2" stroke="#99a86d" strokeWidth=".65">
            <circle cx="47" cy="7" r="2.1" /><circle cx="42" cy="34" r="1.6" />
            <circle cx="82" cy="36" r="1.4" />
          </g>
        </g>
      </svg>}
      <HairShine />
      <BodyShine />
      {bathScrapes.map(({ name, x, y, angle }) => (
        <span key={name} className={ui('wash-spot wash-decoration')} style={{ left: x + '%', top: y + '%' }}>
          <i className={ui('wash-supply-art wash-supply-bandage')} style={{ rotate: angle + 'deg' }} />
        </span>
      ))}
    </div>
  </div>
}
