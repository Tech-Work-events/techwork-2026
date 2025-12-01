/**
 * Configuration centralisée Tech'Work Lyon 2026
 *
 * Ce fichier centralise toutes les configurations de l'application
 * pour faciliter la maintenance et la cohérence.
 */

// Import des configurations
import teamData from './team.json'
import ticketsData from './tickets.json'
import cfpData from './cfp.json'
import socialData from './social.json'
import servicesData from './services.json'
import eventData from './event.json'
import menuData from './menu.json'

// Export des configurations
export const CFP_DATA = cfpData
export const SOCIAL_DATA = socialData
export const SERVICES_DATA = servicesData
export const EVENT_DATA = eventData

// Configuration de l'équipe
export const TEAM_CONFIG = teamData

// Configuration des tickets
export const TICKETS_CONFIG = ticketsData

// Configuration du menu
export const MENU_CONFIG = menuData

// Configuration générale de l'événement (deprecated - use EVENT_DATA instead)
export const EVENT_CONFIG = eventData.event

// Configuration pour les types TypeScript

export interface EventDate {
    full: string
    day: number
    month: string
    year: number
    dayOfWeek: string
    iso: string
}

export interface EventLocation {
    venue: string
    address: string
    city: string
    region: string
    country: string
    coordinates: {
        lat: number
        lng: number
    }
    capacity: number
    rooms: Array<{
        name: string
        capacity: number
        type: string
    }>
}

export interface EventConfig {
    event: {
        name: string
        shortName: string
        tagline: string
        description: string
        year: string
        date: EventDate
        duration: {
            days: number
            hours?: number
            startTime: string
            endTime?: string
        }
        location: EventLocation
        theme: {
            main: string
            subThemes: string[]
        }
        statistics: {
            expectedAttendees: number
            speakers: number
            talks: number
            workshops: number
            partners: number
        }
        pricing: {
            currency: string
            freeForEmployees: boolean
            sponsoredByEmployers: boolean
        }
    }
    organization: {
        name: string
        legalName: string
        founded: string
        siret: string | null
        website: string
        mission: string
    }
    branding: {
        logo: {
            primary: string
            white: string
            dark: string
        }
        colors: {
            primary: string
            secondary: string
            accent: string
        }
        fonts: {
            heading: string
            body: string
        }
    }
}

export interface TeamMember {
    id: string
    name: string
    role: string
    bio: string
    responsibilities: string
    superpower: string
    techDetail: {
        type: 'ide' | 'coffee' | 'tools' | 'platform' | 'stack'
        value: string
    }
    mood: string
    funFact: string
    photoUrl: string
    socials: Array<{
        icon: string
        name: string
        link: string
    }>
}

export interface TicketType {
    id: string
    name: string
    price: number
    originalPrice?: number
    url: string
    ticketsCount: number
    available: boolean
    soldOut: boolean
    highlighted: boolean
    badge?: string
    note?: string
    description: string
    features: string[]
}

export interface SocialNetwork {
    id: string
    name: string
    url: string
    icon: string
    color: string
    description: string
    handle: string
}

export interface SocialConfig {
    networks: SocialNetwork[]
    contact: {
        general: string
        team: string
        speakers: string
        sponsors: string
        location: string
        newsletter: string
        press: string
    }
    hashtags: string[]
}

export interface ServiceAPI {
    enabled: boolean
    endpoint: string | null
    key: string | null
}

export interface MenuItemConfig {
    label: string
    route: string
    enabled: boolean
    icon: string
    description: string
    order: number
}

export interface ServicesConfig {
    ticketing: {
        platform: string
        baseUrl: string
        organizerUrl: string
        api: ServiceAPI
    }
    cfp: {
        platform: string
        publicUrl: string
        organizerUrl: string
        api: ServiceAPI
    }
    streaming: {
        platform: string
        channelUrl: string
        liveUrl: string
        playlistUrl: string
    }
    sponsors: {
        platform: string
        publicUrl: string
        docUrl: string
        api: ServiceAPI
    }
    newsletter: {
        platform: string
        signupUrl: string
        api: ServiceAPI
    }
    community: {
        whatsapp: {
            inviteUrl: string
            groupId: string
        }
        slack: {
            inviteUrl: string | null
            workspaceId: string | null
        }
        telegram: {
            groupUrl: string | null
            channelUrl: string | null
        }
    }
    documentation: {
        website: string
        blog: string
        pressKit: string
        mediaKit: string
    }
    legal: {
        privacyPolicy: string
        termsOfService: string
        codeOfConduct: string
        cookiePolicy: string
    }
    monitoring: {
        analytics: {
            googleAnalytics: string
            plausible: string
        }
        errorTracking: {
            sentry: string | null
        }
        performance: {
            lighthouse: boolean
        }
    }
}
