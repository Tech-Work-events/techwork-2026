import { describe, it, expect } from 'vitest'
import { mergeUtm, buildUrlWithUtm, getIncomingUtmFromLocation } from '../../src/utils/utm'

describe('UTM utils', () => {
    it('mergeUtm: incoming overrides defaults and removes empties', () => {
        const incoming = { utm_source: 'linkedin', utm_medium: 'social', utm_campaign: '' }
        const defaults = { utm_source: 'google', utm_medium: 'organic', utm_campaign: 'techwork-2026' }
        const merged = mergeUtm(incoming, defaults)
        expect(merged).toEqual({ utm_source: 'linkedin', utm_medium: 'social', utm_campaign: 'techwork-2026' })
    })

    it('buildUrlWithUtm: appends/query-sets utm parameters', () => {
        const url = buildUrlWithUtm('https://example.com/path', { utm_source: 'linkedin', utm_medium: 'social' })
        expect(url).toContain('utm_source=linkedin')
        expect(url).toContain('utm_medium=social')
    })

    it('buildUrlWithUtm: preserves existing params', () => {
        const url = buildUrlWithUtm('https://example.com/path?foo=bar', { utm_source: 'google' })
        expect(url).toContain('foo=bar')
        expect(url).toContain('utm_source=google')
    })

    it('getIncomingUtmFromLocation: extracts utm fields', () => {
        const utm = getIncomingUtmFromLocation({
            search: '?utm_source=linkedin&utm_medium=social&utm_campaign=launch&utm_content=hero',
        })
        expect(utm).toEqual({
            utm_source: 'linkedin',
            utm_medium: 'social',
            utm_campaign: 'launch',
            utm_content: 'hero',
        })
    })
})
