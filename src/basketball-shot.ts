export type Point = { x: number; y: number }
export type ShotFrame = Point & { inNet: boolean; touchingNet: boolean; rotation: number; netStretch: number; netSway: number }

export const courtSize = { width: 2440, height: 1200 }
export const playerPosition = { x: 1850, y: 670 }
export const shootingSpots = [playerPosition.x, 760, 1120, 1370, 1600, 2020, 2130]
export const releasePoint = { x: playerPosition.x + 33, y: playerPosition.y + 61 }
export const hoopPlacement = { x: 0, y: 240, width: 507, height: 705 }

export function hoopPoint(x: number, y: number): Point {
  return {
    x: hoopPlacement.x + x / 1024 * hoopPlacement.width,
    y: hoopPlacement.y + y / 1536 * hoopPlacement.height,
  }
}

export const rim = { left: hoopPoint(688, 387).x, right: hoopPoint(970, 387).x, y: hoopPoint(829, 387).y, depth: 34 }
export const netLength = 110
const rimCenter = (rim.left + rim.right) / 2
export const defaultAim: Point = { x: 990, y: 200 }
export const shotStep = 1 / 240

const gravity = 1850
export const ballRadius = 34
export const floorY = 1054
const rimPosts = [rim.left, rim.right].map(x => ({ x, y: rim.y }))
// Trace the front and visible thickness of the pencil backboard in sprite pixels.
const backboard = [[528, 36], [567, 12], [581, 15], [715, 145], [715, 356],
  [698, 527], [677, 532], [534, 455], [528, 443]].map(([x, y]) => hoopPoint(x, y))
const boardEdges = backboard.map((start, index) => {
  const end = backboard[(index + 1) % backboard.length]
  const length = Math.hypot(end.x - start.x, end.y - start.y)
  return { start, length, tangent: { x: (end.x - start.x) / length, y: (end.y - start.y) / length } }
})
const boardBounds = {
  left: Math.min(...backboard.map(point => point.x)) - ballRadius,
  right: Math.max(...backboard.map(point => point.x)) + ballRadius,
  top: Math.min(...backboard.map(point => point.y)) - ballRadius,
  bottom: Math.max(...backboard.map(point => point.y)) + ballRadius,
}

export function netRadius(depth: number) {
  return (rim.right - rim.left) * (.5 - depth * .31)
}

export function aimFromPointer(x: number, y: number): Point {
  return {
    x: Math.max(0, Math.min(courtSize.width, x)),
    y: Math.max(-120, Math.min(courtSize.height, y)),
  }
}

function launchVelocity(target: Point, playerX: number) {
  const origin = { x: releasePoint.x + playerX - playerPosition.x, y: releasePoint.y }
  const aim = aimFromPointer(target.x, target.y)
  const rise = origin.y - aim.y
  const across = aim.x - origin.x
  const travelTime = Math.min(.85, .57 + Math.abs(across) / 3100)
  const risingTime = Math.sqrt(Math.max(0, 1.98 * rise / gravity))
  const duration = Math.max(.42, Math.min(travelTime, risingTime))
  return { origin, duration, x: across / duration, y: -rise / duration - gravity * duration / 2 }
}

export function aimGuide(target: Point, playerX = playerPosition.x) {
  const velocity = launchVelocity(target, playerX)
  const { origin, duration: end } = velocity
  const spacingBetweenDots = Math.max(50, Math.hypot(velocity.x, velocity.y + gravity * end / 2) * end / 13)
  const dots: Point[] = []
  let previous = origin
  let spacing = 34
  let firstTime = 0
  for (let time = shotStep; time < end; time += shotStep) {
    const point = {
      x: origin.x + velocity.x * time,
      y: origin.y + velocity.y * time + gravity * time ** 2 / 2,
    }
    spacing -= Math.hypot(point.x - previous.x, point.y - previous.y)
    if (spacing <= 0) {
      const remaining = end - time
      const distanceToEnd = Math.hypot(velocity.x * remaining, (velocity.y + gravity * (end + time) / 2) * remaining)
      if (distanceToEnd < 28) break
      dots.push(point)
      if (dots.length === 1) firstTime = time
      spacing += spacingBetweenDots
    }
    previous = point
  }
  const start = dots[0] ?? origin
  const controlDuration = (end - firstTime) / 2
  const curve = {
    start,
    control: { x: start.x + velocity.x * controlDuration, y: start.y + (velocity.y + gravity * firstTime) * controlDuration },
    finish: { x: origin.x + velocity.x * end, y: origin.y + velocity.y * end + gravity * end ** 2 / 2 },
  }
  return { dots, curve }
}

type Impact = { fraction: number; normalX: number; normalY: number; restitution: number }

function sweepPost(x: number, y: number, dx: number, dy: number, post: Point, radius: number, restitution: number): Impact | undefined {
  const offsetX = x - post.x
  const offsetY = y - post.y
  const toward = offsetX * dx + offsetY * dy
  if (toward >= 0) return
  const speedSquared = dx ** 2 + dy ** 2
  const discriminant = toward ** 2 - speedSquared * (offsetX ** 2 + offsetY ** 2 - radius ** 2)
  if (discriminant <= 0) return
  const fraction = (-toward - Math.sqrt(discriminant)) / speedSquared
  if (fraction < 0 || fraction > 1) return
  return { fraction, normalX: (offsetX + dx * fraction) / radius, normalY: (offsetY + dy * fraction) / radius, restitution }
}

function sweepHoop(x: number, y: number, dx: number, dy: number) {
  let nearest: Impact | undefined
  if (Math.max(x, x + dx) >= boardBounds.left && Math.min(x, x + dx) <= boardBounds.right
    && Math.max(y, y + dy) >= boardBounds.top && Math.min(y, y + dy) <= boardBounds.bottom) {
    for (const { start, length, tangent } of boardEdges) {
      const normalX = tangent.y
      const normalY = -tangent.x
      const toward = dx * normalX + dy * normalY
      if (toward < 0) {
        const distance = (x - start.x) * normalX + (y - start.y) * normalY
        const fraction = (ballRadius - distance) / toward
        const along = (x - start.x + dx * fraction) * tangent.x + (y - start.y + dy * fraction) * tangent.y
        if (fraction >= 0 && fraction <= (nearest?.fraction ?? 1) && along >= 0 && along <= length) {
          nearest = { fraction, normalX, normalY, restitution: .76 }
        }
      }
      const corner = sweepPost(x, y, dx, dy, start, ballRadius, .76)
      if (corner && corner.fraction < (nearest?.fraction ?? 1)) nearest = corner
    }
  }
  for (const post of rimPosts) {
    const impact = sweepPost(x, y, dx, dy, post, ballRadius + 4, .73)
    if (impact && impact.fraction < (nearest?.fraction ?? 1)) nearest = impact
  }
  return nearest
}

export function traceShot(target: Point, playerX = playerPosition.x) {
  const velocity = launchVelocity(target, playerX)
  let vx = velocity.x
  let vy = velocity.y
  let { x, y } = velocity.origin
  let made = false
  let firstContact = Infinity
  let rotation = 0
  let netStretch = 0
  let netSway = 0
  let stretchSpeed = 0
  let swaySpeed = 0
  let previousNetSide = 0
  let rolling = 0
  let spin = vx / ballRadius * .45
  const frames: ShotFrame[] = [{ x, y, inNet: false, touchingNet: false, rotation, netStretch, netSway }]

  function applyFriction(normalX: number, normalY: number, normalImpulse: number, coefficient: number) {
    const slip = vy * normalX - vx * normalY - spin * ballRadius
    const limit = normalImpulse * coefficient
    // A hollow sphere has rotational inertia of two thirds of its mass times its radius squared.
    const tangentImpulse = Math.max(-limit, Math.min(limit, -slip / 2.5))
    vx -= tangentImpulse * normalY
    vy += tangentImpulse * normalX
    spin -= tangentImpulse * 1.5 / ballRadius
  }

  function rebound({ normalX, normalY, restitution }: Impact, step: number) {
    const approach = vx * normalX + vy * normalY
    if (approach >= 0) return
    x += normalX * .01
    y += normalY * .01
    const impulse = -(1 + restitution) * approach
    vx += impulse * normalX
    vy += impulse * normalY
    applyFriction(normalX, normalY, impulse, .17)
    firstContact = Math.min(firstContact, step)
    swaySpeed -= impulse * normalX * .12
    stretchSpeed += impulse * (.0012 - normalY * .001)
  }

  function advance(time: number, step: number) {
    const oldX = x
    const oldY = y
    x += vx * time
    y += (vy + gravity * time / 2) * time
    vy += gravity * time
    rotation += spin * time * 180 / Math.PI
    if (!made && vy > 0 && oldY < rim.y && y >= rim.y) {
      const crossingX = oldX + (x - oldX) * (rim.y - oldY) / (y - oldY)
      if (crossingX <= rim.left + ballRadius || crossingX >= rim.right - ballRadius) return
      made = true
      swaySpeed += vx * .1
      stretchSpeed += vy * .0035
      vx *= .32
      firstContact = Math.min(firstContact, step)
    }
  }

  for (let step = 1; step * shotStep <= 8; step++) {
    const oldY = y
    if (rolling) {
      const speed = vx * Math.exp(-5 * shotStep)
      const distance = (vx - speed) / 5
      x += distance
      rotation += distance / ballRadius * 180 / Math.PI
      vx = speed
      rolling += shotStep
    } else {
      let remaining = shotStep
      for (let contacts = 0; remaining > .000001; contacts++) {
        const impact = !made && contacts < 3
          ? sweepHoop(x, y, vx * remaining, (vy + gravity * remaining / 2) * remaining)
          : undefined
        if (!impact) {
          advance(remaining, step)
          break
        }
        const duration = remaining * impact.fraction
        advance(duration, step)
        if (!made) rebound(impact, step)
        remaining -= duration
      }
    }

    const netHeight = netLength * (1 + netStretch)
    const netDepth = (y - rim.y) / netHeight
    const row = Math.max(0, Math.min(1, netDepth))
    const acrossNet = x - rimCenter - netSway * row ** 2
    const side = Math.sign(acrossNet)
    const sideDistance = Math.abs(acrossNet) - netRadius(row)
    const inNet = made && netDepth >= 0 && netDepth <= 1 + ballRadius / netHeight && sideDistance < ballRadius
    const brushingNet = !inNet && netDepth > .12 && netDepth < 1.2 && Math.abs(sideDistance) < ballRadius
    if (brushingNet && side !== previousNetSide) {
      swaySpeed += (vx * .13 || -side * 18)
      stretchSpeed += vy * .002
      if (vx * side < 0) vx *= .8
      vy *= .96
    }
    previousNetSide = brushingNet ? side : 0
    if (inNet) {
      vx = vx * Math.exp(-7.4 * shotStep) - acrossNet * 22 * shotStep
      vy *= Math.exp(-1.8 * shotStep)
      stretchSpeed += Math.max(0, vy) * .066 * shotStep
    }
    swaySpeed += (-105 * netSway - 8 * swaySpeed) * shotStep
    stretchSpeed += (-155 * netStretch - 11 * stretchSpeed) * shotStep
    netSway += swaySpeed * shotStep
    netStretch = Math.max(-.2, Math.min(.44, netStretch + stretchSpeed * shotStep))

    if (y >= floorY && vy > 0) {
      const speedBefore = vy - gravity * shotStep
      const fall = Math.max(0, floorY - oldY)
      const impactSpeed = Math.sqrt(speedBefore ** 2 + 2 * gravity * fall)
      y = floorY
      const restitution = .29 + .355 * Math.min(1, impactSpeed / 1400)
      vy = -impactSpeed * restitution
      applyFriction(0, -1, impactSpeed - vy, .28)
      firstContact = Math.min(firstContact, step)
      if (vy ** 2 / (2 * gravity) < 7) {
        vy = 0
        rolling = shotStep
      }
    }

    if (rolling) spin = vx / ballRadius
    frames.push({ x, y, inNet, touchingNet: inNet || brushingNet, rotation, netStretch, netSway })
    if (rolling > .8 || (rolling > .16 && Math.abs(vx) < 24)) break
  }

  return { frames, made, aimEnd: Math.min(firstContact, frames.length - 1) }
}
