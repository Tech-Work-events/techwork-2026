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
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod }
    }
Object.defineProperty(exports, '__esModule', { value: true })
exports.processRGPDRequest = void 0
const functions = __importStar(require('firebase-functions'))
const admin = __importStar(require('firebase-admin'))
const busboy_1 = __importDefault(require('busboy'))
const config_1 = require('../config')
const email_1 = require('../services/email')
const rgpd_1 = require('../templates/rgpd')
// Fonction pour valider un email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}
// Fonction pour traiter les demandes RGPD
exports.processRGPDRequest = functions.https.onRequest((request, response) => {
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
            // Parser les données du formulaire multipart
            const busboy = (0, busboy_1.default)({ headers: request.headers })
            const formData = {}
            const attachments = []
            busboy.on('field', (fieldname, val) => {
                formData[fieldname] = val
            })
            busboy.on('file', (_fieldname, file, info) => {
                const { filename, mimeType } = info
                // Ignorer les fichiers vides ou sans nom
                if (!filename || filename.trim() === '') {
                    file.resume() // Consommer le stream
                    return
                }
                const chunks = []
                file.on('data', (chunk) => chunks.push(chunk))
                file.on('end', () => {
                    const content = Buffer.concat(chunks)
                    if (content.length > 0) {
                        attachments.push({
                            filename: filename,
                            content: content.toString('base64'),
                            contentType: mimeType,
                        })
                    }
                })
            })
            busboy.on('finish', async () => {
                try {
                    // Valider les données requises
                    const requiredFields = [
                        'requestType',
                        'userEmail',
                        'requestDetails',
                        'identityConfirmed',
                        'processingConsent',
                    ]
                    for (const field of requiredFields) {
                        if (!formData[field]) {
                            response.status(400).json({ error: `Champ requis manquant: ${field}` })
                            return
                        }
                    }
                    // Créer l'objet demande
                    const rgpdRequest = {
                        requestType: formData.requestType,
                        userEmail: formData.userEmail,
                        requestDetails: formData.requestDetails,
                        identityConfirmed: formData.identityConfirmed === 'true',
                        processingConsent: formData.processingConsent === 'true',
                        attachments: attachments,
                    }
                    // Valider le type de demande
                    if (!rgpd_1.REQUEST_TYPE_NAMES[rgpdRequest.requestType]) {
                        response.status(400).json({ error: 'Type de demande invalide' })
                        return
                    }
                    // Valider l'email
                    if (!validateEmail(rgpdRequest.userEmail)) {
                        response.status(400).json({ error: 'Adresse email invalide' })
                        return
                    }
                    // Générer le numéro de suivi
                    const trackingNumber = `RGPD-${Date.now()}`
                    // Préparer les emails
                    const requestTypeName = rgpd_1.REQUEST_TYPE_NAMES[rgpdRequest.requestType]
                    // Envoyer l'email à l'équipe avec les pièces jointes
                    try {
                        await (0, email_1.sendBrevoEmail)(
                            config_1.brevoConfig.toEmail,
                            `Demande RGPD - ${requestTypeName} - ${trackingNumber}`,
                            (0, rgpd_1.createTeamEmailTemplate)(rgpdRequest, trackingNumber),
                            attachments
                        )
                    } catch (emailError) {
                        console.error('Erreur envoi email équipe:', emailError)
                        throw emailError
                    }
                    // Envoyer l'email de confirmation à l'utilisateur
                    try {
                        await (0, email_1.sendBrevoEmail)(
                            rgpdRequest.userEmail,
                            `Confirmation - ${requestTypeName} - ${trackingNumber}`,
                            (0, rgpd_1.createUserConfirmationTemplate)(rgpdRequest, trackingNumber)
                        )
                    } catch (emailError) {
                        console.error('Erreur envoi email confirmation:', emailError)
                        // On continue même si l'email de confirmation échoue
                    }
                    // Sauvegarder la demande dans Firestore
                    await admin
                        .firestore()
                        .collection('rgpd-requests')
                        .add(
                            Object.assign(Object.assign({}, rgpdRequest), {
                                trackingNumber,
                                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                                attachments: attachments.map((att) => ({
                                    filename: att.filename,
                                    contentType: att.contentType,
                                    size: att.content.length,
                                })),
                            })
                        )
                    // Réponse de succès
                    response.status(200).json({
                        success: true,
                        message: 'Demande RGPD traitée avec succès',
                        requestType: requestTypeName,
                        trackingNumber: trackingNumber,
                    })
                } catch (error) {
                    console.error('Erreur lors du traitement:', error)
                    response.status(500).json({
                        error: 'Erreur lors du traitement de la demande',
                        details: error instanceof Error ? error.message : 'Erreur inconnue',
                    })
                }
            })
            // Traiter la requête
            busboy.end(request.rawBody)
        } catch (error) {
            console.error('Erreur dans processRGPDRequest:', error)
            response.status(500).json({
                error: 'Erreur du serveur',
                details: error instanceof Error ? error.message : 'Erreur inconnue',
            })
        }
    })
})
//# sourceMappingURL=rgpd.js.map
