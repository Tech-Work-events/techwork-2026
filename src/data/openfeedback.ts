// Identifiant de l'évènement OpenFeedback de Tech'Work — public et stable.
// À modifier ici si l'évènement est recréé. Sert à construire les URLs de
// feedback par talk : https://openfeedback.io/{eventId}/{date}/{sessionId}
export const OPENFEEDBACK_EVENT_ID = 'BR8HzqCDbXYeLhhvcLNk'

const OPENFEEDBACK_BASE_URL = 'https://openfeedback.io'

// Page publique récap de l'évènement sur OpenFeedback : liste toutes les sessions
// notables, point d'entrée global du feedback (onglet « Avis » du live).
export const OPENFEEDBACK_EVENT_URL = `${OPENFEEDBACK_BASE_URL}/${OPENFEEDBACK_EVENT_ID}`

interface FeedbackUrlInput {
    sessionId: string
    // Timestamp de début en heure locale naïve (conference-hall.ts a déjà
    // retiré le fuseau via fixTimestamp), ex. "2026-06-18T16:00:00.000".
    dateStart: string
    hasSpeakers: boolean
}

// Construit l'URL publique de feedback OpenFeedback d'un talk.
// Retourne null pour les créneaux sans orateur (pauses, logistique) : ils sont
// masqués du feedback, comme dans public/openfeedback.json (hideInFeedback).
export function getFeedbackUrl({ sessionId, dateStart, hasSpeakers }: FeedbackUrlInput): string | null {
    if (!hasSpeakers || !dateStart) return null
    const date = dateStart.slice(0, 10)
    return `${OPENFEEDBACK_BASE_URL}/${OPENFEEDBACK_EVENT_ID}/${date}/${sessionId}`
}
