const images = new Map<string, Promise<void>>()

export function loadImage(source: string) {
  let promise = images.get(source)
  if (!promise) {
    const image = new Image()
    image.decoding = 'async'
    image.src = source
    promise = image.decode().catch(error => {
      images.delete(source)
      throw error
    })
    images.set(source, promise)
  }
  return promise
}

export function loadImages(sources: readonly string[]) {
  return Promise.all([...new Set(sources)].map(loadImage))
}
