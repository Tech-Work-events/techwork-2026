import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import partnersData from '../../src/config/partners.json'
import type { PartnersConfig } from '../../src/types/partner'

const config = partnersData as unknown as PartnersConfig

const PROJECT_ROOT = join(__dirname, '..', '..')
const SCAN_ROOTS = ['src/components', 'src/pages']

const collectAstroFiles = (root: string): string[] => {
    const abs = join(PROJECT_ROOT, root)
    const result: string[] = []
    const walk = (dir: string) => {
        const entries = readdirSync(dir)
        for (const entry of entries) {
            const fullPath = join(dir, entry)
            const stats = statSync(fullPath)
            if (stats.isDirectory()) {
                walk(fullPath)
            } else if (stats.isFile() && fullPath.endsWith('.astro')) {
                result.push(fullPath)
            }
        }
    }
    walk(abs)
    return result
}

const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const collectPartnerNames = (cfg: PartnersConfig): string[] => {
    return [...cfg.communityPartners, ...cfg.animationPartners].map((p) => p.name)
}

describe('Architecture: partners.json est single source of truth (need scenario 5 / US-4)', () => {
    const allAstroFiles = SCAN_ROOTS.flatMap(collectAstroFiles)
    const partnerNames = collectPartnerNames(config)

    it('au moins un fichier .astro doit être scanné (sanity check)', () => {
        expect(allAstroFiles.length).toBeGreaterThan(0)
    })

    it('au moins un partner doit être déclaré dans partners.json (sanity check)', () => {
        expect(partnerNames.length).toBeGreaterThan(0)
    })

    it('aucun composant .astro ne hardcode un nom de partner défini dans partners.json', () => {
        const violations: Array<{ file: string; partner: string; line: number; excerpt: string }> = []

        for (const filePath of allAstroFiles) {
            const content = readFileSync(filePath, 'utf-8')
            const lines = content.split('\n')

            for (const partnerName of partnerNames) {
                // Use word-boundary-aware regex; partner names may include spaces and punctuation
                const pattern = new RegExp(escapeRegex(partnerName), 'g')
                lines.forEach((line, idx) => {
                    if (pattern.test(line)) {
                        violations.push({
                            file: relative(PROJECT_ROOT, filePath),
                            partner: partnerName,
                            line: idx + 1,
                            excerpt: line.trim().slice(0, 120),
                        })
                    }
                })
            }
        }

        if (violations.length > 0) {
            const message =
                `Hardcoded partner names found in .astro files (use partners.json instead):\n` +
                violations.map((v) => `  - ${v.file}:${v.line} mentions "${v.partner}" → ${v.excerpt}`).join('\n')
            throw new Error(message)
        }

        expect(violations).toEqual([])
    })
})
