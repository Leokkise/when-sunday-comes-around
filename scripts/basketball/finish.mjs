import sharp from 'sharp'

export const addedHeight = 30

export function bringOutPencil(data, width, columns, bodyStarts) {
  const original = Buffer.from(data)
  const cellWidth = width / columns
  for (const [frame, firstY] of bodyStarts.entries()) {
    const left = (frame % columns) * cellWidth
    const bottom = (Math.floor(frame / columns) + 1) * 512
    for (let y = firstY; y < bottom - 1; y++) {
      const strength = Math.min(1, (y - firstY) / 10) * .5
      for (let x = left + 1; x < left + cellWidth - 1; x++) {
        const pixel = (y * width + x) * 4
        if (original[pixel + 3] < 245) continue
        let green = 0
        let count = 0
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const neighbor = pixel + (dy * width + dx) * 4
          if (original[neighbor + 3] < 245) continue
          green += original[neighbor + 1]
          count++
        }
        const detail = Math.max(-7, Math.min(7, Math.round((original[pixel + 1] - green / count) * strength)))
        for (let channel = 0; channel < 3; channel++) {
          data[pixel + channel] = Math.max(0, Math.min(255, original[pixel + channel] + detail))
        }
      }
    }
  }
}

export async function lengthenStance(input) {
  const width = 640, height = 960
  const legTop = 580, footTop = 850
  // Lift the head, torso and ball together. Add the height between the hips and feet.
  const [upper, legs, feet] = await Promise.all([
    sharp(input).extract({ left: 0, top: addedHeight, width, height: legTop - addedHeight }).png().toBuffer(),
    sharp(input).extract({ left: 0, top: legTop, width, height: footTop - legTop })
      .resize(width, footTop - legTop + addedHeight, { fit: 'fill' }).png().toBuffer(),
    sharp(input).extract({ left: 0, top: footTop, width, height: height - footTop }).png().toBuffer(),
  ])
  return sharp({ create: { width, height, channels: 4, background: '#00000000' } })
    .composite([{ input: upper, left: 0, top: 0 }, { input: legs, left: 0, top: legTop - addedHeight },
      { input: feet, left: 0, top: footTop }]).png().toBuffer()
}
