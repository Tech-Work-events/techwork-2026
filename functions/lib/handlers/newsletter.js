'use strict'
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k
              var desc = Object.getOwnPropertyDescriptor(m, k)
              if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                  desc = {
                      enumerable: true,
                      get: function () {
                          return m[k]
                      },
                  }
              }
              Object.defineProperty(o, k2, desc)
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k
              o[k2] = m[k]
          })
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? function (o, v) {
              Object.defineProperty(o, 'default', { enumerable: true, value: v })
          }
        : function (o, v) {
              o['default'] = v
          })
var __importStar =
    (this && this.__importStar) ||
    (function () {
        var ownKeys = function (o) {
            ownKeys =
                Object.getOwnPropertyNames ||
                function (o) {
                    var ar = []
                    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
                    return ar
                }
            return ownKeys(o)
        }
        return function (mod) {
            if (mod && mod.__esModule) return mod
            var result = {}
            if (mod != null)
                for (var k = ownKeys(mod), i = 0; i < k.length; i++)
                    if (k[i] !== 'default') __createBinding(result, mod, k[i])
            __setModuleDefault(result, mod)
            return result
        }
    })()
Object.defineProperty(exports, '__esModule', { value: true })
exports.subscribeNewsletter = void 0
const functions = __importStar(require('firebase-functions'))
const config_1 = require('../config')
const email_1 = require('../services/email')
const newsletter_1 = require('../templates/newsletter')
// Fonction pour valider un email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}
// Fonction pour l'inscription newsletter
exports.subscribeNewsletter = functions.https.onRequest((request, response) => {
    return (0, config_1.corsHandler)(request, response, async () => {
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
            const { email, source } = request.body
            // Valider l'email
            if (!email || !validateEmail(email)) {
                response.status(400).json({ error: 'Adresse email invalide' })
                return
            }
            try {
                // Créer le contact dans Brevo
                await (0, email_1.createBrevoContact)(email, source)
                // Envoyer l'email de bienvenue
                await (0, email_1.sendBrevoEmail)(
                    email,
                    `Bienvenue dans la newsletter Tech'Work Lyon !`,
                    (0, newsletter_1.createNewsletterWelcomeTemplate)()
                )
                response.status(200).json({
                    success: true,
                    message: 'Inscription réussie à la newsletter',
                })
            } catch (error) {
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
//# sourceMappingURL=newsletter.js.map
