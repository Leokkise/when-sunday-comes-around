export function zoomOutLayout(width: number, height: number, windowWidth: number) {
  if (windowWidth <= 0) return undefined
  const zoom = width / windowWidth
  // Ignore rounding differences and preserve normal zoom-in and narrow layouts.
  if (zoom <= 1.01) return undefined
  return { zoom, width: windowWidth, height: height / zoom }
}
