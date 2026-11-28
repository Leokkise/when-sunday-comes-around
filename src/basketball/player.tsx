import { type CSSProperties } from 'react'
import { shotRows, shotTicks, spriteColumns, walkFrameCount, walkRows } from './character-frames'
import { ui } from '../ui-classes'
import shotAtlas from '../../assets/basketball/character/player-shot-atlas.webp'
import walkAtlas from '../../assets/basketball/character/player-walk-atlas.webp'

export const characterArt = [shotAtlas, walkAtlas]

export function characterFrame(frame: number, walking: boolean) {
  return Math.max(0, Math.min(Math.floor(frame), (walking ? walkFrameCount : shotTicks.length) - 1))
}

function frameStyle(frame: number, rows: number): CSSProperties {
  return {
    width: `${spriteColumns * 100}%`, height: `${rows * 100}%`,
    left: `${-(frame % spriteColumns) * 100}%`, top: `${-Math.floor(frame / spriteColumns) * 100}%`,
  }
}

export function BasketballPlayer({ walking, frame, started }: { walking: boolean; frame: number; started: boolean }) {
  const index = characterFrame(frame, walking)
  return <span className={ui('hoops-player-body')} data-character-frame={index}>
    <img src={shotAtlas} alt="" draggable={false} className={ui('hoops-player-atlas')} data-atlas-hidden={walking || undefined}
      style={frameStyle(walking ? 5 : index, shotRows)} />
    {started && <img src={walkAtlas} alt="" draggable={false} className={ui('hoops-player-atlas')} data-atlas-hidden={!walking || undefined}
      style={frameStyle(walking ? index : 0, walkRows)} />}
  </span>
}
