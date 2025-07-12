/**
 * Configuration du CFP Tech'Work Lyon 2026
 * 
 * Ce fichier contient la configuration du Call for Papers.
 * Modifiez les valeurs ci-dessous pour mettre à jour les informations
 * affichées sur la page CFP.
 */

export const CFP_CONFIG = {
    // Statut du CFP
    isOpen: true,
    
    // Dates importantes (format français lisible)
    deadline: "15 février 2026",
    eventDate: "20 mai 2026",
    
    // Lieu de l'événement
    location: "Lyon, France",
    
    // Description
    description: "L'événement tech qui révolutionne votre façon de travailler",
    
    // URLs
    submissionUrl: "https://conference-hall.io/team/tech-work",
    contactEmail: "speakers@techwork.lyon",
    
    // Formats de talks disponibles
    formats: [
        {
            name: "Lightning Talk",
            duration: "20 minutes",
            description: "5 minutes pour présenter une idée, un projet, une découverte",
            emoji: "⚡"
        },
        {
            name: "Talk Standard", 
            duration: "45 minutes",
            description: "Format classique pour approfondir un sujet technique",
            emoji: "🎯"
        },
        {
            name: "Atelier",
            duration: "45 minutes", 
            description: "Session pratique pour apprendre en faisant",
            emoji: "🛠️"
        }
    ],
    
    // Thèmes recherchés
    topics: [
        {
            name: "Data & IA",
            description: "Machine Learning, Data Science, IA générative",
            emoji: "🤖",
            color: "blue"
        },
        {
            name: "DevOps & Infra",
            description: "CI/CD, Infrastructure as Code, Kubernetes", 
            emoji: "⚙️",
            color: "green"
        },
        {
            name: "Dev & Craft",
            description: "Architecture, Clean Code, frameworks",
            emoji: "💻", 
            color: "orange"
        }
    ]
}

/**
 * Fonction utilitaire pour vérifier si le CFP est encore ouvert
 * en fonction de la date limite
 */
export function isCFPOpen(): boolean {
    // Pour l'instant, on se fie à la configuration manuelle
    // On pourrait ajouter une logique de date automatique ici
    return CFP_CONFIG.isOpen
}

/**
 * Fonction pour obtenir le statut du CFP avec style
 */
export function getCFPStatus() {
    const isOpen = isCFPOpen()
    return {
        isOpen,
        label: isOpen ? 'Ouvert' : 'Fermé',
        emoji: isOpen ? '🟢' : '🔴',
        className: isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }
}