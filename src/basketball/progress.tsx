import type { CSSProperties } from 'react'
import { ui } from '../ui-classes'
import ballArt from '../../assets/basketball/scene/ball-soft.webp'

export function BasketballProgress({ baskets, goal, idle }: { baskets: number; goal: number; idle: boolean }) {
  return <div className={ui('hoops-score')} role="img" aria-label={`${baskets} of ${goal} baskets made`}>
    {Array.from({ length: goal }, (_, index) => <span key={index} className={ui('hoops-progress-idle')} data-idle={idle}
      style={{ '--hoops-idle-delay': `${index * -.18}s` } as CSSProperties}>
      <span className={ui('hoops-progress-ball')} data-filled={index < baskets}
        style={{ '--hoops-progress-delay': `${index * 35}ms` } as CSSProperties}>
      {index < baskets ? <img src={ballArt} alt="" draggable={false} />
        : <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="13.2" fill="#faf7f0" />
          <path d="M16 2.8c-7.2-.3-13.4 5.9-13.2 13.3C2.6 23.3 8.6 29.5 16 29.2c7.5.3 13.4-5.8 13.2-13.2C29.5 8.5 23.1 2.6 16 2.8ZM16 3v26M3 16h26M7 6c8 5 8 15 0 20M25 6c-8 5-8 15 0 20" stroke="#795d46" strokeWidth="1.15" strokeLinecap="round" />
        </svg>}
      </span>
    </span>)}
  </div>
}
