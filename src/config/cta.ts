import servicesData from './services.json'

export const TICKETING_BASE_URL: string = servicesData.ticketing.baseUrl

// Defaults per your guidance. Incoming UTM values will override these when present.
export const UTM_DEFAULTS = {
    utm_source: 'website', // fallback; actual sources: google, linkedin
    utm_medium: 'organic', // fallback; actual mediums: organic, social, email, referral
    utm_campaign: 'Tech & wine devient TechWork et revient pour une nouvelle édition',
}

export const REFUND_POLICY_SNIPPET =
    'Remboursement possible sur demande (association) — écris-nous à contact@techwork.events'
