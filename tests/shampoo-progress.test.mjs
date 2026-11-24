import assert from 'node:assert/strict'
import { addShampooRub, restoreShampooProgress, shampooAreaAt, shampooMoves } from '../src/shampoo-progress.ts'

let progress = [0, 0, 0]
for (let i = 0; i < 100; i++) progress = addShampooRub(progress, shampooAreaAt(.15))
assert.deepEqual(progress, [10, 0, 0])
assert.equal(progress.reduce((sum, count) => sum + count, 0), 10)
for (const x of [.5, .85]) for (let i = 0; i < 10; i++) progress = addShampooRub(progress, shampooAreaAt(x))
assert.equal(progress.reduce((sum, count) => sum + count, 0), shampooMoves)
assert.deepEqual(restoreShampooProgress([4, 8, 2]), [4, 8, 2])
assert.deepEqual(restoreShampooProgress([-4, 100, '10']), [0, 10, 0])
assert.deepEqual(restoreShampooProgress(30), [0, 0, 0])
assert.equal(shampooAreaAt(1 / 3), 1)
assert.equal(shampooAreaAt(2 / 3), 2)
assert.equal(shampooAreaAt(1), 2)
for (const x of [-.1, 1.1, NaN, Infinity]) assert.equal(shampooAreaAt(x), null)
console.log('Shampoo requires all three areas, caps repeats and restores validated area progress.')
