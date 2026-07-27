import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { normalizePresetResponse } from './templates.ts'

describe('event-mock preset templates', () => {
  it('uses the whole template object as the response instead of extracting data', () => {
    const preset = {
      id: '1',
      title: 'gcp成功',
      data: {
        gcpResult: {
          resultCode: '0',
        },
      },
    }

    assert.deepEqual(normalizePresetResponse(preset), preset)
  })

  it('parses string templates and still keeps the whole parsed object', () => {
    const preset = '{"id":"1","data":{"ok":true}}'

    assert.deepEqual(normalizePresetResponse(preset), {
      id: '1',
      data: { ok: true },
    })
  })
})
