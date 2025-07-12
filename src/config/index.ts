/**
 * Configuration centralisée Tech'Work Lyon 2026
 * 
 * Ce fichier centralise toutes les configurations de l'application
 * pour faciliter la maintenance et la cohérence.
 */

// Import des configurations
import { CFP_CONFIG, isCFPOpen, getCFPStatus } from './cfp'
import teamData from './team.json'
import ticketsData from './tickets.json'

// Export des configurations CFP
export { CFP_CONFIG, isCFPOpen, getCFPStatus }

// Configuration de l'équipe
export const TEAM_CONFIG = teamData

// Configuration des tickets
export const TICKETS_CONFIG = ticketsData

// Configuration générale de l'événement
export const EVENT_CONFIG = {
  name: "Tech'Work Lyon 2026",
  date: "20 mai 2026",
  location: "Lyon, France",
  year: 2026,
  
  // Contact
  contact: {
    email: "contact@techwork.lyon",
    team: "team@techwork.lyon",
    speakers: "speakers@techwork.lyon",
    lieu: "lieu@techwork.lyon",
    news: "news@techwork.lyon"
  },
  
  // Réseaux sociaux
  social: {
    discord: "https://discord.gg/techwork-lyon",
    twitter: "https://twitter.com/techworklyon",
    linkedin: "https://linkedin.com/company/techwork-lyon"
  },
  
  // URLs importantes
  urls: {
    tickets: "https://www.eventbrite.fr/e/billets-techwork-lyon-2026",
    cfp: "https://conference-hall.io/team/tech-work"
  }
}

// Configuration pour les types TypeScript
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