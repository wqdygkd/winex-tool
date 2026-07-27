import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  createDispatchResult,
  getValueByPath,
  matchesConditions,
  parseParams,
  selectRule,
  serializeResponse,
} from './matcher.ts'
import type { MockRule } from '../types.ts'

const rules: MockRule[] = [
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
  {
    id: 'rule-disabled',
    enabled: false,
    eventId: '399297247',
    title: 'disabled',
    conditions: [{ path: 'body.cardType', value: '身份证' }],
    response: { source: 'disabled' },
  },
]

describe('event-mock matcher', () => {
  it('parses string, object, and empty params safely', () => {
    assert.deepEqual(parseParams('{"body":{"cardType":"医保卡"}}'), { body: { cardType: '医保卡' } })
    assert.deepEqual(parseParams({ body: { cardType: '医保卡' } }), { body: { cardType: '医保卡' } })
    assert.deepEqual(parseParams('not-json'), {})
    assert.deepEqual(parseParams(undefined), {})
  })

  it('reads nested values by dot path', () => {
    assert.equal(getValueByPath({ body: { cardType: '医保卡' } }, 'body.cardType'), '医保卡')
    assert.equal(getValueByPath({ body: null }, 'body.cardType'), undefined)
    assert.equal(getValueByPath({ body: { cardType: '医保卡' } }, ''), undefined)
  })

  it('matches all configured conditions with loose string equivalence', () => {
    assert.equal(matchesConditions({ body: { code: 1 } }, [{ path: 'body.code', value: '1' }]), true)
    assert.equal(matchesConditions({ body: { code: 2 } }, [{ path: 'body.code', value: '1' }]), false)
  })

  it('selects a conditioned rule before the default fallback', () => {
    const selected = selectRule(rules, '399297247', '{"body":{"cardType":"医保卡"}}')
    assert.equal(selected?.id, 'rule-card')
  })

  it('uses the first unconditioned enabled rule as fallback', () => {
    const selected = selectRule(rules, '399297247', '{"body":{"cardType":"其他"}}')
    assert.equal(selected?.id, 'rule-default')
  })

  it('ignores empty path conditions and keeps empty value conditions matchable', () => {
    const selected = selectRule(
      [
        {
          id: 'rule-empty-value',
          enabled: true,
          eventId: '399297247',
          title: 'empty value',
          conditions: [
            { path: '', value: '医保卡' },
            { path: 'body.cardType', value: '' },
          ],
          response: { source: 'empty-value' },
        },
      ],
      '399297247',
      '{"body":{"cardType":""}}',
    )

    assert.equal(selected?.id, 'rule-empty-value')
  })

  it('ignores disabled rules and unknown event ids', () => {
    assert.equal(selectRule(rules, '399297247', '{"body":{"cardType":"身份证"}}')?.id, 'rule-default')
    assert.equal(selectRule(rules, 'unknown', '{}'), null)
  })

  it('serializes responses and returns a guidance message when no rule matches', () => {
    assert.equal(serializeResponse({ ok: true }), '{"ok":true}')
    const circular: Record<string, unknown> = {}
    circular.self = circular
    assert.equal(serializeResponse(circular), '{}')
    assert.equal(createDispatchResult(null), '{"message":"未匹配到规则，请在设置页面配置"}')
  })
})
