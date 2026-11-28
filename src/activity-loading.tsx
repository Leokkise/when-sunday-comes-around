import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ui } from './ui-classes'
import { BedtimeQuilt, nightQuilt } from './bedtime-transition'
import { loadImage } from './image-loading'

const activityCursors = ['/cursors/bath-pointer.svg', '/cursors/bath-pointer-hover.svg', '/cursors/hand-grab.svg', '/cursors/hand-grabbing.svg']

type LoadingCancel = { label: string; onClick: () => void }

export function ActivityEntry({ assets, label, errorMessage, children, night = false, onReady, cancel }: {
  assets: readonly string[]
  label: string
  errorMessage: string
  children: ReactNode
  night?: boolean
  onReady?: () => void
  cancel?: LoadingCancel
}) {
  const [phase, setPhase] = useState<'loading' | 'rendering' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const scene = useRef<HTMLDivElement>(null)
  const ready = phase === 'ready'
  useEffect(() => { if (ready) onReady?.() }, [ready, onReady])
  const sources = useMemo(() => [...new Set([...activityCursors, ...assets, ...(night ? [nightQuilt] : [])])], [assets, night])
  useEffect(() => {
    if (!night || !ready) return
    const timer = window.setTimeout(() => setRevealed(true),
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 550)
    return () => window.clearTimeout(timer)
  }, [night, ready])

  useEffect(() => {
    let active = true
    Promise.all(sources.map(async src => {
      await loadImage(src)
      if (active) setLoaded(previous => previous + 1)
    })).then(
      () => { if (active) setPhase('rendering') },
      () => { if (active) setPhase('error') },
    )
    return () => { active = false }
  }, [sources, attempt])

  useEffect(() => {
    if (phase !== 'rendering' || !scene.current) return
    let active = true
    let frame = 0
    const images = [...scene.current.querySelectorAll<HTMLImageElement>('img:not([loading="lazy"])')]
    Promise.all([...images.map(image => image.decode()), document.fonts.load('400 16px Schoolbell')]).then(() => {
      if (!active) return
      setLoaded(sources.length + 1)
      // Leave the overlay in place through a frame with the decoded scene mounted.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setPhase('ready'))
      })
    }, () => { if (active) setPhase('error') })
    return () => {
      active = false
      cancelAnimationFrame(frame)
    }
  }, [phase, sources])

  return <>
    {(phase === 'rendering' || ready) && <div ref={scene} className="contents" inert={!ready}>{children}</div>}
    {(!ready || (night && !revealed)) && <ActivityLoading label={label} loaded={loaded} total={sources.length + 1} cancel={cancel}
      night={night} revealing={ready}
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
  cancel?: LoadingCancel
  night?: boolean
  revealing?: boolean
}

function ActivityLoading({ label, loaded, total, error, onRetry, night, revealing, cancel }: LoadingProps) {
  return <main className={ui(`activity-loading fixed inset-0 z-[110] grid place-content-center justify-items-center gap-5 p-6 text-center ${night ? 'night-loading' : ''}`)}
    data-revealing={revealing || undefined}>
    {night && <BedtimeQuilt />}
    <p className={ui("activity-loading-title m-0 leading-tight")} role="status" data-loading={!error || undefined}>{error || label}</p>
    {!error && <div className={ui("activity-loading-track overflow-hidden")} role="progressbar" aria-label={label}
      aria-valuemin={0} aria-valuemax={total} aria-valuenow={loaded}>
      <span className={ui("activity-loading-fill block h-full origin-left")} style={{ transform: `scaleX(${loaded / total})` }} />
    </div>}
    {error && <button className={ui("cta")} onClick={onRetry}>Try again</button>}
    {cancel ? <button type="button" className={ui("activity-loading-back cursor-pointer underline underline-offset-4")} onClick={cancel.onClick}>{cancel.label}</button> :
      <a className={ui("activity-loading-back underline underline-offset-4")} href="/">Back to home</a>}
  </main>
}
