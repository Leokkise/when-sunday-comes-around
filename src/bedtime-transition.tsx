import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ui } from './ui-classes'
import nightQuilt from '../assets/bedtime-night-quilt.webp'
export { nightQuilt }

export function BedtimeQuilt() {
  return <img src={nightQuilt} className="pointer-events-none absolute inset-0 size-full object-cover object-right"
    width="1200" height="800" alt="" draggable={false} aria-hidden="true" />
}

export function BedtimeLink({ children, className }: { children: ReactNode; className: string }) {
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    const image = new Image()
    image.src = nightQuilt
  }, [])
  useEffect(() => {
    if (!leaving) return
    const timer = window.setTimeout(() => window.location.assign('/dress-up/'), 1450)
    return () => window.clearTimeout(timer)
  }, [leaving])

  return <>
    <a href="/dress-up/" className={className} aria-disabled={leaving || undefined} onClick={event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
        || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      event.preventDefault()
      setLeaving(true)
    }}>{children}</a>
    {leaving && createPortal(<div className={ui('night-transition')} role="status">
      <div className={ui('night-blanket-cover')}><BedtimeQuilt /></div>
      <span className="sr-only">Heading to the bedroom</span>
    </div>, document.body)}
  </>
}
