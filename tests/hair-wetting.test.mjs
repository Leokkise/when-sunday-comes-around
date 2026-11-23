import assert from 'node:assert/strict'
import { advanceHairSweep } from '../src/hair-wetting.ts'

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
console.log('Hair wetting movement checks passed.')
