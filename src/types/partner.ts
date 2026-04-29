export type PartnerSocialType = 'linkedin' | 'instagram' | 'twitter'

export type PartnerSocial = {
    type: PartnerSocialType
    url: string
}

export type Partner = {
    name: string
    url: string
    logo: string | null
    tagline?: string
    socials: PartnerSocial[]
}

export type AnimationPartnerKind = 'vigneron' | 'artisan' | 'creatrice-mode' | 'association'

export type AnimationPartner = Partner & {
    kind: AnimationPartnerKind
}

export type PartnersConfig = {
    communityPartners: Partner[]
    animationPartners: AnimationPartner[]
}
