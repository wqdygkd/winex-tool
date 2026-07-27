import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { applyTemplateResponse, normalizeConditions } from './rules.ts'
import type { MockRule } from '../types.ts'

describe('event-mock rule helpers', () => {
  it('writes the selected template response into the rule response', () => {
    const rule: MockRule = {
      id: 'rule-1',
      enabled: true,
      eventId: '399297247',
      title: 'reader',
      conditions: [],
      response: { before: true },
    }
    const templateResponse = { card: { type: '医保卡' } }

    applyTemplateResponse(rule, templateResponse)

    assert.deepEqual(rule.response, { card: { type: '医保卡' } })
  })

  it('deep clones template response so later rule edits do not mutate the template', () => {
    const rule: MockRule = {
      id: 'rule-1',
      enabled: true,
      eventId: '399297247',
      title: 'reader',
      conditions: [],
      response: {},
    }
    const templateResponse = { card: { type: '医保卡' } }

    applyTemplateResponse(rule, templateResponse)
    ;(rule.response.card as Record<string, unknown>).type = '身份证'

    assert.deepEqual(templateResponse, { card: { type: '医保卡' } })
  })

  it('filters params match conditions by path only and keeps empty values', () => {
    assert.deepEqual(
      normalizeConditions([
        { path: '', value: '医保卡' },
        { path: '   ', value: '医保卡' },
        { path: 'body.empty', value: '' },
        { path: 'body.blank', value: '   ' },
        { path: ' body.cardType ', value: ' 医保卡 ' },
      ]),
      [
        { path: 'body.empty', value: '' },
        { path: 'body.blank', value: '' },
        { path: 'body.cardType', value: '医保卡' },
      ],
    )
  })
})
