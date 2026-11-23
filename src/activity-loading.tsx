import { ui } from './ui-classes'
type LoadingProps = {
  label: string
  loaded: number
  total: number
  error?: string
  onRetry: () => void
}

export function ActivityLoading({ label, loaded, total, error, onRetry }: LoadingProps) {
  return <main className={ui("activity-loading fixed inset-0 grid place-content-center justify-items-center gap-5 p-6 text-center")}>
    <p className={ui("activity-loading-title m-0 leading-tight")} role="status" data-loading={!error || undefined}>{error || label}</p>
    {!error && <div className={ui("activity-loading-track overflow-hidden")} role="progressbar" aria-label={label}
      aria-valuemin={0} aria-valuemax={total} aria-valuenow={loaded}>
      <span className={ui("activity-loading-fill block h-full origin-left")} style={{ transform: `scaleX(${loaded / total})` }} />
    </div>}
    {error && <button className={ui("cta")} onClick={onRetry}>Try again</button>}
    <a className={ui("activity-loading-back underline underline-offset-4")} href="/">Back to home</a>
  </main>
}
