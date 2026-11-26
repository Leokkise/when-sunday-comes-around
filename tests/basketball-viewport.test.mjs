import assert from 'node:assert/strict'
import { zoomOutLayout } from '../src/basketball/viewport.ts'

assert.equal(zoomOutLayout(1920, 945, 1920), undefined)
assert.equal(zoomOutLayout(1536, 756, 1920), undefined, 'zoom-in keeps its normal behavior')
assert.equal(zoomOutLayout(390, 844, 390), undefined, 'mobile keeps its normal behavior')
assert.equal(zoomOutLayout(390, 844, 1280), undefined, 'narrow browser previews stay responsive')
assert.equal(zoomOutLayout(1921, 945, 1920), undefined, 'ignore browser rounding')
assert.equal(zoomOutLayout(1920, 945, 0), undefined)
for (const browserZoom of [.9, .8, .67, .5, .25]) {
  const layout = zoomOutLayout(1920 / browserZoom, 945 / browserZoom, 1920)
  assert.ok(layout)
  assert.equal(layout.width, 1920)
  assert.ok(Math.abs(layout.height - 945) < .001)
  assert.ok(Math.abs(layout.zoom * browserZoom - 1) < .001, 'preserve the on-screen scale')
}
console.log('Zoom-out correction, normal zoom, zoom-in and narrow layouts passed.')
