import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import { ConfigStorage, createDefaultConfig } from './config.ts'
import { TemplateStorage } from './template.ts'
import type { EventMockConfig, MockTemplate } from '../types.ts'

const store = new Map<string, unknown>()

beforeEach(() => {
  store.clear()
  Object.assign(globalThis, {
    GM_getValue: <T>(key: string, defaultValue: T): T => store.has(key) ? store.get(key) as T : defaultValue,
    GM_setValue: (key: string, value: unknown): void => {
      store.set(key, value)
    },
  })
})

describe('event-mock config storage', () => {
  it('loads the new default config when no value exists', () => {
    const storage = new ConfigStorage()

    assert.deepEqual(createDefaultConfig(), { enabled: false, rules: [] })
    assert.deepEqual(storage.load(), { enabled: false, rules: [] })
  })

  it('saves and returns the new config model', () => {
    const storage = new ConfigStorage()
    const config: EventMockConfig = {
      enabled: true,
      rules: [
        {
          id: 'rule-1',
          enabled: true,
          eventId: '399297247',
          title: 'reader',
          conditions: [],
          response: { ok: true },
        },
      ],
    }

    storage.save(config)

    assert.deepEqual(storage.load(), config)
  })

  it('filters empty params match conditions when saving config', () => {
    const storage = new ConfigStorage()

    storage.save({
      enabled: true,
      rules: [
        {
          id: 'rule-1',
          enabled: true,
          eventId: '399297247',
          title: 'reader',
          conditions: [
            { path: '', value: '医保卡' },
            { path: 'body.empty', value: '' },
            { path: ' body.cardType ', value: ' 医保卡 ' },
          ],
          response: { ok: true },
        },
      ],
    })

    assert.deepEqual(storage.load().rules[0].conditions, [
      { path: 'body.empty', value: '' },
      { path: 'body.cardType', value: '医保卡' },
    ])
  })

  it('ignores stored config values that do not match the new rule model', () => {
    const storage = new ConfigStorage()

    store.set('GM_wqdy_event-mock-config', {
      enable: true,
      events: [{ id: '399297247', title: 'old reader', data: { ok: true } }],
    })

    assert.deepEqual(storage.load(), createDefaultConfig())
  })
})

describe('event-mock template storage', () => {
  it('adds, updates, and removes non-preset templates', () => {
    const storage = new TemplateStorage()
    const template: MockTemplate = {
      id: 'tpl-1',
      eventId: '399297247',
      name: 'reader',
      response: { ok: true },
    }

    storage.add(template)
    assert.deepEqual(storage.getAll(), [template])

    assert.equal(storage.update('tpl-1', { name: 'reader updated' }), true)
    assert.equal(storage.getAll()[0].name, 'reader updated')

    assert.equal(storage.remove('tpl-1'), true)
    assert.deepEqual(storage.getAll(), [])
  })

  it('ignores stored template values that do not match the template model', () => {
    const storage = new TemplateStorage()

    store.set('GM_wqdy_event-mock-templates', {
      id: 'old-template-map',
      data: [],
    })

    assert.deepEqual(storage.getAll(), [])

    store.set('GM_wqdy_event-mock-templates', [
      {
        id: 'broken-template',
        eventId: '399297247',
        name: 'broken',
      },
    ])

    assert.deepEqual(storage.getAll(), [])
  })

  it('imports presets idempotently and refuses to remove preset templates', () => {
    const storage = new TemplateStorage()
    const presets: MockTemplate[] = [
      {
        id: 'preset-reader',
        eventId: '399297247',
        name: 'preset reader',
        response: { ok: true },
        preset: true,
      },
    ]

    assert.equal(storage.importPresets(presets), 1)
    assert.equal(storage.importPresets(presets), 0)
    assert.equal(storage.remove('preset-reader'), false)
    assert.equal(storage.getAll().length, 1)
  })

  it('refreshes existing preset templates with the latest preset response', () => {
    const storage = new TemplateStorage()
    const stalePreset: MockTemplate = {
      id: 'preset-reader',
      eventId: '399297247',
      name: 'preset reader',
      response: {},
      preset: true,
    }
    const latestPreset: MockTemplate = {
      id: 'preset-reader',
      eventId: '399297247',
      name: 'preset reader',
      response: {
        id: '1',
        data: { ok: true },
      },
      preset: true,
    }

    storage.importPresets([stalePreset])

    assert.equal(storage.importPresets([latestPreset]), 1)
    assert.deepEqual(storage.getAll()[0].response, {
      id: '1',
      data: { ok: true },
    })
  })
})
