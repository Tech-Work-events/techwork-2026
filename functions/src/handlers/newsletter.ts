import * as functions from 'firebase-functions'
import { corsHandler } from '../config'
import type { NewsletterRequest } from '../config'
import { sendBrevoEmail, createBrevoContact } from '../services/email'
import { createNewsletterWelcomeTemplate } from '../templates/newsletter'

// Fonction pour valider un email
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Fonction pour l'inscription newsletter
export const subscribeNewsletter = functions.https.onRequest((request, response) => {
    return corsHandler(request, response, async () => {
        try {
            // Gérer les requêtes OPTIONS (preflight)
            if (request.method === 'OPTIONS') {
                response.status(200).end()
                return
            }

            // Vérifier la méthode HTTP
            if (request.method !== 'POST') {
                response.status(405).json({ error: 'Method not allowed' })
                return
            }

            // Extraire les données du formulaire
            const { email, source }: NewsletterRequest = request.body

            // Valider l'email
            if (!email || !validateEmail(email)) {
                response.status(400).json({ error: 'Adresse email invalide' })
                return
            }

            try {
                // Créer le contact dans Brevo
                await createBrevoContact(email, source)

                // Envoyer l'email de bienvenue
                await sendBrevoEmail(
                    email,
                    `Bienvenue dans la newsletter Tech'Work Lyon !`,
                    createNewsletterWelcomeTemplate()
                )

                response.status(200).json({
                    success: true,
                    message: 'Inscription réussie à la newsletter',
                })
            } catch (error: any) {
                console.error("Erreur lors de l'inscription:", error)

                // Gestion spécifique des contacts déjà existants
                if (error.code === 'DUPLICATE_CONTACT') {
                    response.status(200).json({
                        success: true,
                        message: 'Vous êtes déjà inscrit·e à la newsletter',
                    })
                } else {
                    throw error
                }
            }
        } catch (error) {
            console.error('Erreur dans subscribeNewsletter:', error)
            response.status(500).json({
                error: "Erreur lors de l'inscription à la newsletter",
                details: error instanceof Error ? error.message : 'Erreur inconnue',
            })
        }
    })
})
