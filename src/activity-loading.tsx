import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ui } from './ui-classes'

const activityCursors = ['/bath-pointer.svg', '/bath-pointer-hover.svg', '/hand-grab.svg', '/hand-grabbing.svg']

export function ActivityEntry({ assets, label, errorMessage, children }: {
  assets: readonly string[]
  label: string
  errorMessage: string
  children: ReactNode
}) {
  const [phase, setPhase] = useState<'loading' | 'rendering' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const scene = useRef<HTMLDivElement>(null)
  const ready = phase === 'ready'

  useEffect(() => {
    let active = true
    Promise.all([...activityCursors, ...assets].map(async src => {
      const image = new Image()
      image.src = src
      await image.decode()
      if (active) setLoaded(previous => previous + 1)
    })).then(
      () => { if (active) setPhase('rendering') },
      () => { if (active) setPhase('error') },
    )
    return () => { active = false }
  }, [assets, attempt])

  useEffect(() => {
    if (phase !== 'rendering' || !scene.current) return
    let active = true
    let frame = 0
    const images = [...scene.current.querySelectorAll('img')]
    Promise.all([...images.map(image => image.decode()), document.fonts.load('400 16px Schoolbell')]).then(() => {
      if (!active) return
      // Leave the overlay in place through a frame with the decoded scene mounted.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setPhase('ready'))
      })
    }, () => { if (active) setPhase('error') })
    return () => {
      active = false
      cancelAnimationFrame(frame)
    }
  }, [phase])

  return <>
    {(phase === 'rendering' || ready) && <div ref={scene} className="contents" inert={!ready}>{children}</div>}
    {!ready && <ActivityLoading label={label} loaded={loaded} total={assets.length + activityCursors.length + 1}
      error={phase === 'error' ? errorMessage : undefined} onRetry={() => {
        setLoaded(0)
        setPhase('loading')
        setAttempt(previous => previous + 1)
      }} />}
  </>
}

type LoadingProps = {
  label: string
  loaded: number
  total: number
  error?: string
  onRetry: () => void
}

function ActivityLoading({ label, loaded, total, error, onRetry }: LoadingProps) {
  return <main className={ui("activity-loading fixed inset-0 z-[110] grid place-content-center justify-items-center gap-5 p-6 text-center")}>
    <p className={ui("activity-loading-title m-0 leading-tight")} role="status" data-loading={!error || undefined}>{error || label}</p>
    {!error && <div className={ui("activity-loading-track overflow-hidden")} role="progressbar" aria-label={label}
      aria-valuemin={0} aria-valuemax={total} aria-valuenow={loaded}>
      <span className={ui("activity-loading-fill block h-full origin-left")} style={{ transform: `scaleX(${loaded / total})` }} />
    </div>}
    {error && <button className={ui("cta")} onClick={onRetry}>Try again</button>}
    <a className={ui("activity-loading-back underline underline-offset-4")} href="/">Back to home</a>
  </main>
}
