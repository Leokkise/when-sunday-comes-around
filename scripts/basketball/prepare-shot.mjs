import sharp from 'sharp'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { bringOutPencil, lengthenStance } from './finish.mjs'

const directory = new URL('../../art-source/basketball/', import.meta.url)
const output = new URL('../../.cache/basketball/', import.meta.url)
await mkdir(output, { recursive: true })
const { data, info } = await sharp(await readFile(new URL('shooting.webp', directory)))
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
const standingHeight = (poses[0].bottom - poses[0].top + 1) * scale
const ballSize = Math.round(84 * (poses[0].bottom - poses[0].top + 1) / 420.328125)
const ballImage = await sharp(await readFile(new URL('../../assets/basketball/scene/ball-soft.webp', directory)))
  .resize(ballSize).png().toBuffer()

// Green and blue offsets measured against comparable skin highlights in the six poses.
const skinBalance = [[-1, -1], [1, 1], [-2, -3], [0, 0], [-1, -2], [2, 2]]
for (let i = 0; i < data.length; i += 4) {
  const [r, g, b, a] = data.subarray(i, i + 4)
  if (a > 128 && r > 185 && g > 160 && b > 140 && r - g > 8 && r - g < 45 && g - b > 6 && g - b < 32) {
    const x = (i / 4) % info.width, y = Math.floor(i / 4 / info.width)
    const idleSkin = x < 512 && (y < 157 || (y >= 192 && y < 251 && r > 228) || (y >= 342 && y < 426))
    const [green, blue] = skinBalance[Math.floor(y / 512) * 3 + Math.floor(x / 512)]
    const highlight = Math.min(1, Math.max(0, (r - 200) / 25))
    data[i] = Math.min(255, r + (idleSkin ? 3 : 2))
    data[i + 1] = Math.min(255, Math.round(g + (idleSkin ? 9 : 7) + green * highlight))
    data[i + 2] = Math.min(255, Math.round(b + (idleSkin ? 13 : 11) + blue * highlight))
  }
  data[i + 3] = Math.round(Math.max(0, Math.min(255, (a - 28) * 255 / 227)))
}
bringOutPencil(data, info.width, 3, [155, 190, 158, 664, 665, 668])
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
          for (let dx = -1; dx <= 1; dx++) {
            if (ball.name !== 'idle' || (dx === 0 && dy === 0)) skin.add((y + dy) * info.width + x + dx)
          }
        }
      }
    }
  }
  if (ball.name === 'idle') {
    // Keep the connected hand, not the similarly colored numeral or shirt trim.
    const seed = [...skin].sort((a, b) =>
      Math.hypot(a % info.width - 235, Math.floor(a / info.width) - 213)
      - Math.hypot(b % info.width - 235, Math.floor(b / info.width) - 213))[0]
    if (seed === undefined) throw Error('Missing idle hand')
    const connected = new Set([seed]), queue = [seed]
    for (let i = 0; i < queue.length; i++) {
      for (const dy of [-1, 0, 1]) for (const dx of [-1, 0, 1]) {
        const next = queue[i] + dy * info.width + dx
        if (skin.has(next) && !connected.has(next)) { connected.add(next); queue.push(next) }
      }
    }
    skin.clear()
    for (const pixel of connected) for (const dy of [-1, 0, 1]) for (const dx of [-1, 0, 1]) skin.add(pixel + dy * info.width + dx)
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
const frames = new Map()
for (const pose of poses) {
  const poseHeight = pose.bottom - pose.top + 1
  const poseScale = pose.name === 'recovery' ? standingHeight / poseHeight : scale
  const drawing = await sharp(completeDrawing, { raw: info })
    .extract({ left: pose.left, top: pose.top, width: pose.right - pose.left + 1, height: poseHeight })
    .resize(Math.round((pose.right - pose.left + 1) * poseScale), Math.round(poseHeight * poseScale))
    .png().toBuffer()
  const normalized = await sharp({ create: { width: 640, height: 960, channels: 4, background: '#00000000' } })
    .composite([{ input: drawing, left: 320 - Math.round((pose.footX - pose.left) * poseScale),
      top: 944 - Math.round(poseHeight * poseScale) }])
    .png().toBuffer()
  frames.set(pose.name, normalized)
}

// Reuse the approved recovery face in the holding pose. Blend only at the neck join.
const idle = await sharp(frames.get('idle')).raw().toBuffer({ resolveWithObject: true })
const recovery = await sharp(frames.get('recovery')).raw().toBuffer()
const { width } = idle.info
for (let y = 0; y < 325; y++) {
  const weight = Math.min(1, (325 - y) / 15)
  for (let x = 150; x < 485; x++) {
    const pixel = (y * width + x) * 4
    const reference = (y * width + x - 7) * 4
    const idleAlpha = idle.data[pixel + 3] * (1 - weight)
    const faceAlpha = recovery[reference + 3] * weight
    const alpha = idleAlpha + faceAlpha
    for (let channel = 0; channel < 3; channel++) {
      idle.data[pixel + channel] = alpha
        ? Math.round((idle.data[pixel + channel] * idleAlpha + recovery[reference + channel] * faceAlpha) / alpha)
        : 0
    }
    idle.data[pixel + 3] = Math.round(alpha)
  }
}
frames.set('idle', await sharp(idle.data, { raw: idle.info }).png().toBuffer())

for (const [name, frame] of frames) {
  const normalized = await lengthenStance(frame)
  await writeFile(new URL('source-' + name + '.png', output), normalized)
}
await writeFile(new URL('registration.json', output), JSON.stringify({ width: 640, height: 960, scale, standingHeight,
  ballCourtSize: 84, standingCourtHeight: 420.328125, ballImageSize: ballSize, balls, poses }, null, 2))
