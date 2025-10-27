import servicesData from './services.json'

export const TICKETING_BASE_URL: string = servicesData.ticketing.baseUrl

// Defaults per your guidance. Incoming UTM values will override these when present.
export const UTM_DEFAULTS = {
    utm_source: 'linkedin', // defaults updated: linkedin/social
    utm_medium: 'social',
    utm_campaign: 'Tech & wine devient TechWork et revient pour une nouvelle édition',
}

export const REFUND_POLICY_SNIPPET =
    'Remboursement possible sur demande (asso). Et même si les lamas crachent, on ne crache pas dans la soupe :\nsi tu peux éviter, ça aide la communauté ; sinon, écris‑nous : contact@techwork.events'
