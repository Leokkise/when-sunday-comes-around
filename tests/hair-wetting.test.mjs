import assert from 'node:assert/strict'
import { advanceHairRinse, advanceHairSweep } from '../src/hair-wetting.ts'

// A sweep may begin in the middle of wet hair, without first reaching an edge.
const start = advanceHairSweep(null, 385, 120, 'right')
assert.equal(start.complete, false)
assert.equal(advanceHairSweep(start.anchor, 385, 120, 'right').complete, false)
assert.equal(advanceHairSweep(start.anchor, 390, 120, 'right').complete, false)
assert.equal(advanceHairSweep(start.anchor, 410, 120, 'right').complete, true)

// The return sweep counts only after moving left, and works at phone scale too.
assert.equal(advanceHairSweep(410, 420, 120, 'left').complete, false)
assert.equal(advanceHairSweep(410, 385, 120, 'left').complete, true)
assert.equal(advanceHairSweep(200, 212, 60, 'right').complete, true)
assert.equal(advanceHairSweep(null, 410, 120, 'left').complete, false)
assert.equal(advanceHairRinse(0, .8, .12), 0, 'rinsing must start at the left')
let rinse = advanceHairRinse(0, .05, .12)
assert.ok(Math.abs(rinse - .17) < 1e-10)
assert.equal(advanceHairRinse(rinse, .9, .12), rinse, 'cannot skip unrinsed hair')
assert.equal(advanceHairRinse(rinse, 0, .12), rinse, 'moving back preserves rinsed hair')
for (let x = .15; x < 1; x += .1) rinse = advanceHairRinse(rinse, x, .12)
assert.equal(rinse, 1, 'a full left-to-right sweep completes the rinse')
assert.equal(advanceHairRinse(1, .4, .12), 1)
console.log('Hair wetting movement checks passed.')
