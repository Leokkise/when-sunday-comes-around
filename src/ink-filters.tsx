export function InkFilters() {
  return (
      <svg className="ink-filters" width="0" height="0" aria-hidden="true">
        {[2, 5, 8].map(seed => (
          <filter key={seed} id={`title-ink-${seed}`} x="-5%" y="-10%" width="110%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency=".1" numOctaves={2} seed={seed} result="grain" />
            <feDisplacementMap in="SourceGraphic" in2="grain" scale={3} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        ))}
      </svg>
  )
}
