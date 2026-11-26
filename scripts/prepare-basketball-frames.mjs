import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

const source = 'art-source/basketball-review'
const output = 'art-source/basketball/renders'
await mkdir(output, { recursive: true })
execFileSync('node', [source + '/prepare.mjs', '--runtime'])
const registration = JSON.parse(await readFile(source + '/registration.json'))
const { scale } = registration
const shot = registration.poses.map(pose => {
  const ball = registration.balls.find(ball => ball.name === pose.name)
  return { name: pose.name, ball: ball
    ? [320 + (ball.x - pose.footX) * scale, 944 - (pose.bottom - pose.top + 1) * scale + (ball.y - pose.top) * scale]
    : null }
})
const { data, info } = await sharp(source + '/walk-drawings.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true })
if (info.width !== 1536 || info.height !== 1024) throw Error('Unexpected walk sheet dimensions')
for (let i = 0; i < data.length; i += 4) {
  const [r, g, b, a] = data.subarray(i, i + 4)
  // Align the walking sheet's ivory pigment with the approved shooting sheet.
  if (a > 128 && r > 185 && g > 160 && b > 140 && r - g > 8 && r - g < 45 && g - b > 6 && g - b < 32) {
    data[i] = Math.min(255, r + 2)
    data[i + 1] = Math.min(255, g + 10)
    data[i + 2] = Math.min(255, b + 15)
  }
  data[i + 3] = Math.max(0, Math.min(255, (a - 96) * 255 / 159))
}
const walk = Array.from({ length: 8 }, (_, index) => {
  const left = index % 4 * 384, top = Math.floor(index / 4) * 512
  let minX = info.width, minY = info.height, maxX = 0, maxY = 0
  for (let y = top; y < top + 512; y++) for (let x = left; x < left + 384; x++) {
    if (data[(y * info.width + x) * 4 + 3] < 128) continue
    minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y)
  }
  if (minX >= maxX || minY >= maxY) throw Error('Missing walk pose')
  let footLeft = maxX, footRight = minX
  for (let y = maxY - 65; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    if (data[(y * info.width + x) * 4 + 3] < 128) continue
    footLeft = Math.min(footLeft, x); footRight = Math.max(footRight, x)
  }
  return { name: 'walk-' + (index + 1), minX, minY, maxX, maxY, footX: (footLeft + footRight) / 2 }
})
const walkScale = Math.min(900 / Math.max(...walk.map(p => p.maxY - p.minY + 1)),
  ...walk.map(p => 310 / Math.max(p.footX - p.minX + 1, p.maxX - p.footX + 1)))
for (const pose of walk) {
  const crop = await sharp(data, { raw: info }).extract({ left: pose.minX, top: pose.minY,
    width: pose.maxX - pose.minX + 1, height: pose.maxY - pose.minY + 1 })
    .resize(Math.round((pose.maxX - pose.minX + 1) * walkScale), Math.round((pose.maxY - pose.minY + 1) * walkScale))
    .png().toBuffer()
  await sharp({ create: { width: 640, height: 960, channels: 4, background: '#00000000' } })
    .composite([{ input: crop, left: 320 - Math.round((pose.footX - pose.minX) * walkScale),
      top: 944 - Math.round((pose.maxY - pose.minY + 1) * walkScale) }])
    .png().toFile(output + '/source-' + pose.name + '.png')
}
await writeFile(output + '/poses.json', JSON.stringify({ shot, walk, width: 640, height: 960,
  spriteWidth: 640 * registration.standingCourtHeight / 900, anchor: [320, 944] }))
