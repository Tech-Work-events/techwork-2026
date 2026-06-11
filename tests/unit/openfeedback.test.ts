import { describe, it, expect } from 'vitest'
import { getFeedbackUrl, OPENFEEDBACK_EVENT_ID } from '../../src/data/openfeedback'

describe('getFeedbackUrl', () => {
    it("construit l'URL OpenFeedback du talk (eventId, date, sessionId)", () => {
        const url = getFeedbackUrl({
            sessionId: 'abc123',
            dateStart: '2026-06-18T16:00:00.000',
            hasSpeakers: true,
        })
        expect(url).toBe(`https://openfeedback.io/${OPENFEEDBACK_EVENT_ID}/2026-06-18/abc123`)
    })

    it('dérive la date (YYYY-MM-DD) depuis le timestamp de début', () => {
        const url = getFeedbackUrl({
            sessionId: 'x',
            dateStart: '2026-06-19T09:30:00.000',
            hasSpeakers: true,
        })
        expect(url).toContain('/2026-06-19/')
    })

    it('retourne null pour une session sans orateur (pause / logistique)', () => {
        const url = getFeedbackUrl({
            sessionId: 'pause-1',
            dateStart: '2026-06-18T12:00:00.000',
            hasSpeakers: false,
        })
        expect(url).toBeNull()
    })

    it('retourne null si dateStart est vide', () => {
        const url = getFeedbackUrl({ sessionId: 'x', dateStart: '', hasSpeakers: true })
        expect(url).toBeNull()
    })
})
