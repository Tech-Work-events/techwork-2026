export type CtaVariant = 'reserve' | 'jeviens' | 'banco' | 'monbillet'

export const EXPERIMENTS = {
    // Hero button text variant
    heroCtaVariant: 'reserve' as CtaVariant,
    // Global primary CTA label (header, drawer, sticky)
    ctaLabelVariant: 'reserve' as CtaVariant,
    // Future switches
    stickyEnabled: true,
    socialProofVariant: 'logos' as 'logos' | 'quotes',
}

export const CTA_LABELS: Record<CtaVariant, string> = {
    reserve: 'Réserver ma place',
    jeviens: 'Je viens',
    banco: 'Banco',
    monbillet: 'Mon billet',
}

export function labelFor(variant: CtaVariant): string {
    return CTA_LABELS[variant] ?? CTA_LABELS.reserve
}
