import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { addedHeight, bringOutPencil, lengthenStance } from './finish.mjs'

const source = 'art-source/basketball'
const output = '.cache/basketball'
await mkdir(output, { recursive: true })
execFileSync('node', ['scripts/basketball/prepare-shot.mjs'])
const registration = JSON.parse(await readFile(output + '/registration.json'))
const { scale, standingHeight } = registration
const shot = registration.poses.map(pose => {
  const ball = registration.balls.find(ball => ball.name === pose.name)
  return { name: pose.name, ball: ball
    ? [320 + (ball.x - pose.footX) * scale, 944 - (pose.bottom - pose.top + 1) * scale + (ball.y - pose.top) * scale - addedHeight]
    : null }
})
const { data, info } = await sharp(source + '/walking.webp').ensureAlpha().raw().toBuffer({ resolveWithObject: true })
if (info.width !== 1536 || info.height !== 1024) throw Error('Unexpected walk sheet dimensions')
// Match the walking highlights to the same ivory palette as the shot poses.
const skinBalance = [[-5, -6], [-2, -3], [-2, -1], [-2, -1], [-3, -3], [-2, -2], [0, 1], [-1, 0]]
for (let i = 0; i < data.length; i += 4) {
  const [r, g, b, a] = data.subarray(i, i + 4)
  // Match the supplied walk sheet to the shooting sheet's ivory, red and brown pigments.
  if (a > 128 && r > 185 && g > 160 && b > 140 && r - g > 8 && r - g < 45 && g - b > 6 && g - b < 32) {
    const x = (i / 4) % info.width, y = Math.floor(i / 4 / info.width)
    const [green, blue] = skinBalance[Math.floor(y / 512) * 4 + Math.floor(x / 384)]
    const highlight = Math.min(1, Math.max(0, (r - 200) / 25))
    data[i] = Math.min(255, r + 6)
    data[i + 1] = Math.min(255, Math.round(g + 6 + green * highlight))
    data[i + 2] = Math.min(255, Math.round(b + 5 + blue * highlight))
  } else if (a > 128 && r > 100 && r < 210 && r - g > 30 && g - b > 5 && g - b < 35) {
    data[i] = Math.min(255, r + 19)
    data[i + 1] = g - 4
    data[i + 2] = b - 6
  } else if (a > 128 && r > 45 && r < 125 && r - g >= 0 && r - g < 20 && g - b >= 0 && g - b < 20) {
    data[i] = r + 6
    data[i + 1] = g - 1
    data[i + 2] = b - 7
  }
  data[i + 3] = Math.max(0, Math.min(255, (a - 96) * 255 / 159))
}
bringOutPencil(data, info.width, 4, [163, 172, 184, 166, 669, 684, 696, 675])
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
const walkScale = Math.min(standingHeight / Math.max(...walk.map(p => p.maxY - p.minY + 1)),
  ...walk.map(p => 310 / Math.max(p.footX - p.minX + 1, p.maxX - p.footX + 1)))
for (const pose of walk) {
  const crop = await sharp(data, { raw: info }).extract({ left: pose.minX, top: pose.minY,
    width: pose.maxX - pose.minX + 1, height: pose.maxY - pose.minY + 1 })
    .resize(Math.round((pose.maxX - pose.minX + 1) * walkScale), Math.round((pose.maxY - pose.minY + 1) * walkScale))
    .png().toBuffer()
  const normalized = await sharp({ create: { width: 640, height: 960, channels: 4, background: '#00000000' } })
    .composite([{ input: crop, left: 320 - Math.round((pose.footX - pose.minX) * walkScale),
      top: 944 - Math.round((pose.maxY - pose.minY + 1) * walkScale) }])
    .png().toBuffer()
  await writeFile(output + '/source-' + pose.name + '.png', await lengthenStance(normalized))
}
await writeFile(output + '/poses.json', JSON.stringify({ shot, walk, width: 640, height: 960,
  spriteWidth: 640 * registration.standingCourtHeight / 900, anchor: [320, 944] }))
