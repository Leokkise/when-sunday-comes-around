import assert from 'node:assert/strict'
import { loadImage, loadImages } from '../src/image-loading.ts'

const requested = []
let fail = true
globalThis.Image = class {
  decode() {
    requested.push(this.src)
    return this.src === 'retry.webp' && fail ? Promise.reject(new Error('Offline')) : Promise.resolve()
  }
}

await loadImages(['room.webp', 'room.webp', 'character.webp'])
await loadImage('room.webp')
assert.deepEqual(requested, ['room.webp', 'character.webp'])
await assert.rejects(loadImage('retry.webp'), /Offline/)
fail = false
await loadImage('retry.webp')
assert.equal(requested.filter(source => source === 'retry.webp').length, 2)
console.log('Image loads are shared, deduplicated and retryable after failure.')
