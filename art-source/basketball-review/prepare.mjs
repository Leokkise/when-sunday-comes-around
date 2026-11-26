import sharp from 'sharp'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const directory = new URL('./', import.meta.url)
const runtime = process.argv.includes('--runtime')
const runtimeDirectory = new URL('../basketball/renders/', directory)
if (runtime) await mkdir(runtimeDirectory, { recursive: true })
await mkdir(new URL('drawings/', directory), { recursive: true })
const { data, info } = await sharp(await readFile(new URL('character-drawings.png', directory)))
  .ensureAlpha().raw().toBuffer({ resolveWithObject: true })
if (info.width !== 1536 || info.height !== 1024) throw Error('Unexpected shooting drawing dimensions')
const names = ['idle', 'dip', 'set', 'release', 'follow-through', 'recovery']
const balls = JSON.parse(await readFile(new URL('ball-anchors.json', directory)))
const poses = names.map((name, index) => {
  const x0 = index % 3 * 512
  const y0 = Math.floor(index / 3) * 512
  let left = info.width, top = info.height, right = 0, bottom = 0
  for (let y = y0; y < y0 + 512; y++) {
    for (let x = x0; x < x0 + 512; x++) {
      if (data[(y * info.width + x) * 4 + 3] < 128) continue
      left = Math.min(left, x)
      top = Math.min(top, y)
      right = Math.max(right, x)
      bottom = Math.max(bottom, y)
    }
  }
  if (right <= left || bottom <= top) throw Error('Missing drawing for ' + name)
  let footLeft = right, footRight = left
  for (let y = bottom - 18; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      if (data[(y * info.width + x) * 4 + 3] < 128) continue
      footLeft = Math.min(footLeft, x)
      footRight = Math.max(footRight, x)
    }
  }
  const ball = balls.find(ball => ball.name === name)
  if (ball) left = Math.min(left, Math.floor(ball.x - 50))
  return { name, left, top, right, bottom, footX: (footLeft + footRight) / 2 }
})
const scale = Math.min(900 / (poses[0].bottom - poses[0].top + 1),
  ...poses.map(pose => Math.min(940 / (pose.bottom - pose.top + 1),
    310 / Math.max(pose.footX - pose.left + 1, pose.right - pose.footX + 1))))
const ballSize = Math.round(84 * (poses[0].bottom - poses[0].top + 1) / 420.328125)
const ballImage = await sharp(await readFile(new URL('../../assets/basketball/ball-soft.webp', directory)))
  .resize(ballSize).png().toBuffer()

for (let i = 0; i < data.length; i += 4) {
  const [r, g, b, a] = data.subarray(i, i + 4)
  if (a > 128 && r > 185 && g > 160 && b > 140 && r - g > 8 && r - g < 45 && g - b > 6 && g - b < 32) {
    data[i] = Math.min(255, r + 2)
    data[i + 1] = Math.min(255, g + 7)
    data[i + 2] = Math.min(255, b + 11)
  }
  data[i + 3] = Math.round(Math.max(0, Math.min(255, (a - 28) * 255 / 227)))
}
const overlays = []
for (const ball of balls) {
  const skin = new Set()
  const radius = ballSize * .43
  const left = Math.floor(ball.x - radius - 2), right = Math.ceil(ball.x + radius + 2)
  const top = Math.floor(ball.y - radius - 2), bottom = Math.ceil(ball.y + radius + 2)
  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      const i = (y * info.width + x) * 4
      const [r, g, b, a] = data.subarray(i, i + 4)
      if (a > 128 && r > 165 && g > 155 && b > 135 && r >= b && r - b < 75) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) skin.add((y + dy) * info.width + x + dx)
        }
      }
    }
  }
  const fingers = Buffer.alloc(data.length)
  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      if (Math.hypot(x - ball.x, y - ball.y) > radius + 1) continue
      const i = (y * info.width + x) * 4
      if (skin.has(y * info.width + x)) data.copy(fingers, i, i, i + 4)
    }
  }
  overlays.push({ input: ballImage, left: Math.round(ball.x - ballSize / 2), top: Math.round(ball.y - ballSize / 2) })
  overlays.push({ input: await sharp(fingers, { raw: info }).png().toBuffer(), left: 0, top: 0 })
}
const completeDrawing = await sharp(data, { raw: info }).composite(overlays).raw().toBuffer()
for (let i = 3; i < data.length; i += 4) {
  if (completeDrawing[i] < data[i]) throw Error('Ball compositing removed character coverage')
}
for (const pose of poses) {
  const drawing = await sharp(completeDrawing, { raw: info })
    .extract({ left: pose.left, top: pose.top, width: pose.right - pose.left + 1, height: pose.bottom - pose.top + 1 })
    .resize(Math.round((pose.right - pose.left + 1) * scale), Math.round((pose.bottom - pose.top + 1) * scale))
    .png().toBuffer()
  const normalized = await sharp({ create: { width: 640, height: 960, channels: 4, background: '#00000000' } })
    .composite([{ input: drawing, left: 320 - Math.round((pose.footX - pose.left) * scale),
      top: 944 - Math.round((pose.bottom - pose.top + 1) * scale) }])
    .png().toBuffer()
  await writeFile(new URL('drawings/' + pose.name + '.png', directory), normalized)
  await writeFile(new URL('poses/' + pose.name + '.png', directory), normalized)
  if (runtime) await writeFile(new URL('source-' + pose.name + '.png', runtimeDirectory), normalized)
}
await writeFile(new URL('registration.json', directory), JSON.stringify({ width: 640, height: 960, scale,
  ballCourtSize: 84, standingCourtHeight: 420.328125, ballImageSize: ballSize, balls, poses }, null, 2))
