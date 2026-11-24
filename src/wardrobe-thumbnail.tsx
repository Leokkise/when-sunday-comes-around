import { useEffect, useRef, useState } from 'react'
import { ui } from './ui-classes'

export function WardrobeThumbnail({ source }: { source: string }) {
  const container = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const element = container.current
    if (!element) return
    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true)
        observer.disconnect()
      }
    }, { root: element.closest('#pajama-options'), rootMargin: '80px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return <span ref={container} className={ui('dress-thumbnail')} aria-hidden="true">
    {failed ? <span className="text-sm">Preview unavailable</span>
      : visible && <img src={source} alt="" loading="lazy" decoding="async"
        className="size-full object-contain" onError={() => setFailed(true)} />}
  </span>
}
