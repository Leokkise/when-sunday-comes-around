import assert from 'node:assert/strict'
import { aimFromPointer, aimGuide, ballRadius, courtSize, defaultAim, floorY, playerPosition, releasePoint, rim, shootingSpots, shotStep, traceShot } from '../src/basketball-shot.ts'

assert.deepEqual(aimFromPointer(600, 400), { x: 600, y: 400 })
assert.deepEqual(aimFromPointer(-100, -100), { x: 0, y: -100 })
assert.deepEqual(aimFromPointer(4000, 2000), { x: courtSize.width, y: courtSize.height })

const swish = traceShot(defaultAim)
assert.equal(swish.made, true)
assert.equal(swish.frames[swish.aimEnd].inNet, true)
assert.deepEqual({ x: swish.frames[0].x, y: swish.frames[0].y }, releasePoint)
assert.notEqual(swish.frames[80].rotation, 0, 'the ball spins in flight')
assert.ok(swish.frames.some(frame => frame.netStretch > .2), 'the ball pulls the net downward')
assert.ok(swish.frames.some(frame => frame.netSway > 1) && swish.frames.some(frame => frame.netSway < -1), 'the net sways and rebounds')
assert.ok(Math.abs(swish.frames.at(-1).netStretch) < .001, 'the net settles after the ball passes')
assert.ok(swish.aimEnd * shotStep > 1.15 && swish.aimEnd * shotStep < 1.4, 'a clean shot reaches the hoop at a steady pace')
assert.ok(Math.min(...swish.frames.slice(0, swish.aimEnd).map(frame => Math.hypot(frame.x - defaultAim.x, frame.y - defaultAim.y))) < 6,
  'the ball passes through the aim cursor while rising')

const { dots: guide, curve } = aimGuide(defaultAim)
assert.ok(guide.length >= 9 && guide.length <= 14)
assert.ok(guide.every((dot, index) => dot.y < (guide[index - 1]?.y ?? releasePoint.y)), 'the guide only rises')
assert.ok(guide.every(dot => swish.frames.slice(0, swish.aimEnd).some(frame => Math.hypot(frame.x - dot.x, frame.y - dot.y) < .001)), 'guide uses the real flight path')
assert.ok(guide.at(-1).x > defaultAim.x, 'the dots end before the cursor')
assert.ok(Math.hypot(guide.at(-1).x - defaultAim.x, guide.at(-1).y - defaultAim.y) < 84, 'the dots lead to the cursor')
assert.ok(guide[0].y - guide[4].y > guide[4].y - guide[8].y, 'the guide bends as the ball rises')
assert.ok(aimGuide({ x: 2190, y: 520 }).dots[0].x > releasePoint.x, 'the guide follows the pointer across the player')
assert.deepEqual(curve.start, guide[0])
assert.deepEqual(curve.finish, guide.at(-1))
const longGuide = aimGuide({ x: 105, y: 220 }).curve
const riseAboveChord = ((longGuide.start.y + longGuide.finish.y) / 2 - longGuide.control.y) / 2
assert.ok(riseAboveChord > 90, 'long shots have a visible arc rather than a nearly straight aim line')

// Cursor positions that send the ball toward the board's upper edge, face, and lower section.
for (const target of [{ x: 920, y: 130 }, { x: 950, y: 85 }, { x: 950, y: 145 }, { x: 955, y: 120 }]) {
  const shot = traceShot(target)
  const hit = shot.frames[shot.aimEnd]
  assert.ok(hit.x < rim.right - 40 && hit.y < rim.y - ballRadius, 'the shot contacts the visible board before reaching the rim')
  assert.ok(shot.frames[shot.aimEnd + 1].x > hit.x, 'the ball rebounds from the board')
  assert.ok(Math.abs(shot.frames[shot.aimEnd + 1].netSway) > 0, 'board impact transfers momentum to the net')
}

const rimHit = traceShot({ x: 950, y: 285 })
assert.equal(rimHit.made, false)
assert.ok(rimHit.frames[rimHit.aimEnd + 1].netStretch !== 0, 'rim impact moves the net')

const netBrush = traceShot({ x: 950, y: 390 })
assert.equal(netBrush.made, false)
const netContact = netBrush.frames.findIndex(frame => frame.touchingNet)
assert.ok(netContact > 0 && netContact < netBrush.aimEnd, 'the ball can brush the side of the net without hitting metal')
assert.ok(Math.abs(netBrush.frames[netContact + 1].netSway) > 0)

const miss = traceShot({ x: 1210, y: 390 })
assert.equal(miss.made, false)
assert.ok(miss.frames.every(frame => frame.netStretch === 0 && frame.netSway === 0), 'misses leave the net still')
const contacts = miss.frames.flatMap((frame, index) =>
  frame.y === floorY && miss.frames[index - 1]?.y < floorY ? [index] : [])
assert.ok(contacts.length >= 3, 'the ball bounces before settling into a roll')
const bounceHeights = contacts.slice(0, -1).map((start, index) =>
  floorY - Math.min(...miss.frames.slice(start, contacts[index + 1]).map(frame => frame.y)))
assert.ok(bounceHeights.every((height, index) => height > 0 && (index === 0 || height < bounceHeights[index - 1])), 'bounces lose height')
assert.ok(bounceHeights[0] > 210 && bounceHeights[1] > 40, 'the first two bounces remain visible')
assert.ok(miss.frames.slice(-15).every(frame => frame.y === floorY), 'the ball rolls along the court after the bounces')

for (const target of [defaultAim, { x: 850, y: 600 }, { x: 0, y: 0 }, { x: 1536, y: 1024 }]) {
  const shot = traceShot(target)
  assert.ok(shot.frames.length * shotStep <= 8 + shotStep)
  for (const { x, y, rotation } of shot.frames) {
    assert.ok(Number.isFinite(rotation) && Number.isFinite(x))
    assert.ok(Number.isFinite(y) && y <= floorY)
  }
}
assert.ok(traceShot({ x: 600, y: -100 }).frames.some(frame => frame.y < -50), 'high shots rise above the court')
assert.ok(traceShot({ x: 2300, y: 550 }).frames.some(frame => frame.x > courtSize.width), 'offscreen shots continue without bouncing off an invisible wall')

const spawnAims = [defaultAim, { x: 580, y: 280 }, { x: 730, y: 220 }, { x: 820, y: 170 }, { x: 900, y: 170 }, { x: 1080, y: 110 }, { x: 1120, y: 140 }]
for (const [index, playerX] of shootingSpots.entries()) {
  assert.ok(playerX > rim.right && playerX + 270 <= courtSize.width, 'the player stays on court in front of the hoop')
  const shot = traceShot(spawnAims[index], playerX)
  assert.equal(shot.frames[0].x, releasePoint.x + playerX - playerPosition.x)
  assert.ok(shot.made && shot.frames[shot.aimEnd].inNet, 'a clean basket is reachable from every spot')
  const { dots } = aimGuide(spawnAims[index], playerX)
  assert.ok(dots.every(dot => shot.frames.slice(0, shot.aimEnd).some(frame => Math.hypot(frame.x - dot.x, frame.y - dot.y) < .001)),
    'the guide matches flight after the player moves')
}
console.log('Pointer aiming, scoring, spin, ground collisions and diminishing bounces passed.')
