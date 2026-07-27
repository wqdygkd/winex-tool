import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createEventMockRuntime } from './runtime.ts'
import type { EventMockConfig } from '../types.ts'
import type { WinningSDK } from '../../../types/index.ts'

function createConfig(): EventMockConfig {
  return {
    enabled: true,
    rules: [
      {
        id: 'rule-default',
        enabled: true,
        eventId: '399297247',
        title: 'default reader',
        conditions: [],
        response: { source: 'default' },
      },
      {
        id: 'rule-card',
        enabled: true,
        eventId: '399297247',
        title: 'card reader',
        conditions: [{ path: 'body.cardType', value: '医保卡' }],
        response: { source: 'card' },
      },
    ],
  }
}

describe('event-mock runtime', () => {
  it('mounts dispatchEvent and returns the same result passed to callback', () => {
    const target: { winning?: WinningSDK } = {}
    const runtime = createEventMockRuntime(target)
    let callbackResult = ''

    runtime.update(createConfig())
    const result = target.winning?.dispatchEvent?.(
      '399297247',
      '{"body":{"cardType":"医保卡"}}',
      value => callbackResult = value,
    )

    assert.equal(runtime.isMounted(), true)
    assert.equal(result, '{"source":"card"}')
    assert.equal(callbackResult, '{"source":"card"}')
  })

  it('accepts object params and optional callback', () => {
    const target: { winning?: WinningSDK } = {}
    const runtime = createEventMockRuntime(target)

    runtime.update(createConfig())
    const result = target.winning?.dispatchEvent?.('399297247', { body: { cardType: '其他' } })

    assert.equal(result, '{"source":"default"}')
  })

  it('catches callback errors and still returns the dispatch result', () => {
    const target: { winning?: WinningSDK } = {}
    const runtime = createEventMockRuntime(target)
    const originalError = console.error
    const errors: unknown[] = []

    console.error = (...args: unknown[]) => errors.push(args)
    try {
      runtime.update(createConfig())
      const result = target.winning?.dispatchEvent?.('399297247', '{}', () => {
        throw new Error('business callback failed')
      })

      assert.equal(result, '{"source":"default"}')
      assert.equal(errors.length, 1)
    } finally {
      console.error = originalError
    }
  })

  it('restores the original winning object when disabled', () => {
    const originalWinning: WinningSDK = {
      getIP: () => '1.1.1.1',
      dispatchEvent: () => 'original',
    }
    const target: { winning?: WinningSDK } = { winning: originalWinning }
    const runtime = createEventMockRuntime(target)

    runtime.update(createConfig())
    assert.notEqual(target.winning, originalWinning)

    runtime.update({ enabled: false, rules: [] })

    assert.equal(runtime.isMounted(), false)
    assert.equal(target.winning, originalWinning)
    assert.equal(target.winning?.dispatchEvent?.('x'), 'original')
  })

  it('deletes winning on unmount when there was no original object', () => {
    const target: { winning?: WinningSDK } = {}
    const runtime = createEventMockRuntime(target)

    runtime.update(createConfig())
    runtime.unmount()

    assert.equal(runtime.isMounted(), false)
    assert.equal(target.winning, undefined)
  })
})
