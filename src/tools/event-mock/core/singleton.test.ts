import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('event-mock runtime singleton', () => {
  it('can be imported when unsafeWindow is not defined', async () => {
    assert.equal('unsafeWindow' in globalThis, false)

    await assert.doesNotReject(async () => {
      const module = await import('./singleton.ts')
      assert.equal(typeof module.runtime.dispatchEvent, 'function')
    })
  })
})
