import { describe, it, expect } from 'vitest'
import partnersData from '../../src/config/partners.json'
import type { PartnersConfig } from '../../src/types/partner'

const config = partnersData as unknown as PartnersConfig

describe('partners.json — schema cible (need scenarios 1, 2, 3, 5)', () => {
    describe('scenario 1 (révisé 2026-04-29): Yeeso est partenaire valeurs/animation, pas co-organisateur', () => {
        it('communityPartners contient exactement les 4 co-organisateurs stricts', () => {
            expect(config.communityPartners.length).toBe(4)
        })

        it('les 4 co-organisateurs historiques sont présents', () => {
            const names = config.communityPartners.map((p) => p.name)
            expect(names).toContain('Café DevOps')
            expect(names).toContain('CARA (Club Agile Rhône Alpes)')
            expect(names).toContain('SoCraTes FR')
            expect(names).toContain('GenAi France')
        })

        it("Yeeso n'est PAS dans communityPartners (n'est pas co-organisateur)", () => {
            const yeeso = config.communityPartners.find((p) => p.name === 'Yeeso')
            expect(yeeso).toBeUndefined()
        })

        it('Yeeso est dans animationPartners avec kind=association et sa tagline officielle', () => {
            const yeeso = config.animationPartners.find((p) => p.name === 'Yeeso')
            expect(yeeso).toBeDefined()
            expect(yeeso?.kind).toBe('association')
            expect(yeeso?.tagline).toBe("L'avenir de l'IT avec les femmes")
            expect(yeeso?.url).toBe('https://yeeso.fr/')
            expect(yeeso?.logo).toBe('yeeso.webp')
        })
    })

    describe('scenario 2 (révisé 2026-06-15): animationPartners = 2 assos + 3 artisans J-jour', () => {
        it('la clé animationPartners existe et contient exactement 5 entrées', () => {
            expect(config.animationPartners).toBeDefined()
            expect(Array.isArray(config.animationPartners)).toBe(true)
            expect(config.animationPartners.length).toBe(5)
        })

        it('les 5 partenaires "associations & artisans" sont présents', () => {
            const names = config.animationPartners.map((p) => p.name)
            expect(names).toContain('Yeeso')
            expect(names).toContain('Domaine des Braves')
            expect(names).toContain('Viegne')
            expect(names).toContain('Atelier Minuit 81')
            expect(names).toContain('Pharm O Verre')
        })

        it('Pharm O Verre est une association avec Instagram comme canal principal', () => {
            const pov = config.animationPartners.find((p) => p.name === 'Pharm O Verre')
            expect(pov).toBeDefined()
            expect(pov?.kind).toBe('association')
            const instagram = pov?.socials.find((s) => s.type === 'instagram')
            expect(instagram?.url).toMatch(/^https:\/\/(www\.)?instagram\.com\/pharm_o_verre/)
        })

        it('chaque animation partner a un champ kind valide', () => {
            const validKinds = ['vigneron', 'artisan', 'creatrice-mode', 'association']
            for (const partner of config.animationPartners) {
                expect(validKinds).toContain(partner.kind)
            }
        })
    })

    describe('scenario 3: Atelier Minuit 81 utilise Instagram comme canal principal', () => {
        it('Atelier Minuit 81 a un social Instagram', () => {
            const atelier = config.animationPartners.find((p) => p.name === 'Atelier Minuit 81')
            expect(atelier).toBeDefined()
            const instagram = atelier?.socials.find((s) => s.type === 'instagram')
            expect(instagram).toBeDefined()
            expect(instagram?.url).toMatch(/^https:\/\/(www\.)?instagram\.com\/atelierminuit81/)
        })

        it('Atelier Minuit 81 ne contient pas de social linkedin (non pertinent)', () => {
            const atelier = config.animationPartners.find((p) => p.name === 'Atelier Minuit 81')
            const linkedin = atelier?.socials.find((s) => s.type === 'linkedin')
            expect(linkedin).toBeUndefined()
        })
    })

    describe('migration: linkedin → socials[]', () => {
        it('aucun community partner ne possède plus de propriété linkedin directe', () => {
            for (const partner of config.communityPartners) {
                expect(partner).not.toHaveProperty('linkedin')
            }
        })

        it('tous les community partners ont une propriété socials (peut être tableau vide)', () => {
            for (const partner of config.communityPartners) {
                expect(partner).toHaveProperty('socials')
                expect(Array.isArray(partner.socials)).toBe(true)
            }
        })

        it('aucun animation partner ne possède de propriété linkedin directe', () => {
            for (const partner of config.animationPartners) {
                expect(partner).not.toHaveProperty('linkedin')
            }
        })
    })

    describe('cohérence générale du schema', () => {
        it('chaque partner a name, url et logo (ou null)', () => {
            const all = [...config.communityPartners, ...config.animationPartners]
            for (const partner of all) {
                expect(typeof partner.name).toBe('string')
                expect(partner.name.length).toBeGreaterThan(0)
                expect(typeof partner.url).toBe('string')
                expect(partner.logo === null || typeof partner.logo === 'string').toBe(true)
            }
        })

        it('chaque social a un type et une url valide', () => {
            const all = [...config.communityPartners, ...config.animationPartners]
            const validTypes = ['linkedin', 'instagram', 'twitter']
            for (const partner of all) {
                for (const social of partner.socials) {
                    expect(validTypes).toContain(social.type)
                    expect(social.url).toMatch(/^https?:\/\//)
                }
            }
        })
    })
})
