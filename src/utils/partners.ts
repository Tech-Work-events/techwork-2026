import type { Partner, PartnerSocial, PartnerSocialType } from '../types/partner'

export class MissingPartnerUrlError extends Error {
    constructor(partnerName: string) {
        super(`Partner "${partnerName}" has no usable URL (neither url nor socials[0])`)
        this.name = 'MissingPartnerUrlError'
    }
}

export function pickPrimaryUrl(partner: Partner): string {
    if (partner.url && partner.url.trim() !== '') {
        return partner.url
    }
    if (partner.socials.length > 0) {
        return partner.socials[0].url
    }
    throw new MissingPartnerUrlError(partner.name)
}

export function hasLogo(partner: Partner): boolean {
    return partner.logo !== null && partner.logo !== ''
}

export function getSocialByType(partner: Partner, type: PartnerSocialType): PartnerSocial | undefined {
    return partner.socials.find((s) => s.type === type)
}

export function getDisplayName(partner: Partner): string {
    return partner.name.trim()
}
