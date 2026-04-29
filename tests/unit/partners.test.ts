import { describe, it, expect } from 'vitest'
import {
    pickPrimaryUrl,
    hasLogo,
    getSocialByType,
    getDisplayName,
    MissingPartnerUrlError,
} from '../../src/utils/partners'
import type { Partner } from '../../src/types/partner'

const buildPartner = (overrides: Partial<Partner> = {}): Partner => ({
    name: 'Default',
    url: 'https://default.example/',
    logo: null,
    socials: [],
    ...overrides,
})

describe('pickPrimaryUrl', () => {
    it('retourne partner.url quand elle est définie', () => {
        const partner = buildPartner({ url: 'https://x.example/' })
        expect(pickPrimaryUrl(partner)).toBe('https://x.example/')
    })

    it('retourne le 1er social url quand partner.url est vide (cas Atelier Minuit 81 → Instagram)', () => {
        const partner = buildPartner({
            name: 'Atelier Minuit 81',
            url: '',
            socials: [{ type: 'instagram', url: 'https://www.instagram.com/atelierminuit81/' }],
        })
        expect(pickPrimaryUrl(partner)).toBe('https://www.instagram.com/atelierminuit81/')
    })

    it('lève MissingPartnerUrlError quand ni url ni socials', () => {
        const partner = buildPartner({ name: 'Orphan', url: '', socials: [] })
        expect(() => pickPrimaryUrl(partner)).toThrow(MissingPartnerUrlError)
        expect(() => pickPrimaryUrl(partner)).toThrow(/Orphan/)
    })

    it('ne mute pas le partner en entrée', () => {
        const partner = buildPartner({
            url: 'https://x.example/',
            socials: [{ type: 'linkedin', url: 'https://linkedin.com/x' }],
        })
        const snapshot = JSON.stringify(partner)
        pickPrimaryUrl(partner)
        expect(JSON.stringify(partner)).toBe(snapshot)
    })
})

describe('hasLogo', () => {
    it('retourne true quand logo est une chaîne non vide', () => {
        expect(hasLogo(buildPartner({ logo: 'yeeso.webp' }))).toBe(true)
    })

    it('retourne false quand logo est null', () => {
        expect(hasLogo(buildPartner({ logo: null }))).toBe(false)
    })

    it('retourne false quand logo est une chaîne vide', () => {
        expect(hasLogo(buildPartner({ logo: '' }))).toBe(false)
    })
})

describe('getSocialByType', () => {
    const partner = buildPartner({
        socials: [
            { type: 'linkedin', url: 'https://linkedin.com/x' },
            { type: 'instagram', url: 'https://instagram.com/x' },
        ],
    })

    it('retourne le social du type demandé', () => {
        expect(getSocialByType(partner, 'instagram')).toEqual({
            type: 'instagram',
            url: 'https://instagram.com/x',
        })
    })

    it('retourne undefined si le type est absent', () => {
        expect(getSocialByType(partner, 'twitter')).toBeUndefined()
    })

    it('retourne undefined sur un partner sans socials', () => {
        expect(getSocialByType(buildPartner({ socials: [] }), 'linkedin')).toBeUndefined()
    })
})

describe('getDisplayName', () => {
    it('retourne le nom trim', () => {
        expect(getDisplayName(buildPartner({ name: '  Yeeso  ' }))).toBe('Yeeso')
    })

    it('retourne le nom inchangé si pas d espace', () => {
        expect(getDisplayName(buildPartner({ name: 'CARA (Club Agile Rhône Alpes)' }))).toBe(
            'CARA (Club Agile Rhône Alpes)'
        )
    })
})
