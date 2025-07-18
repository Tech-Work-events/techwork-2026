import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import Busboy from 'busboy'
import { corsHandler, brevoConfig } from '../config'
import type { RGPDRequest } from '../config'
import { sendBrevoEmail } from '../services/email'
import { createTeamEmailTemplate, createUserConfirmationTemplate, REQUEST_TYPE_NAMES } from '../templates/rgpd'

// Fonction pour valider un email
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Fonction pour traiter les demandes RGPD
export const processRGPDRequest = functions.https.onRequest((request, response) => {
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

            // Parser les données du formulaire multipart
            const busboy = Busboy({ headers: request.headers })
            const formData: any = {}
            const attachments: Array<{
                filename: string
                content: string
                contentType: string
            }> = []

            busboy.on('field', (fieldname: string, val: string) => {
                formData[fieldname] = val
            })

            busboy.on('file', (_fieldname: string, file: any, info: any) => {
                const { filename, mimeType } = info

                // Ignorer les fichiers vides ou sans nom
                if (!filename || filename.trim() === '') {
                    file.resume() // Consommer le stream
                    return
                }

                const chunks: Buffer[] = []
                file.on('data', (chunk: Buffer) => chunks.push(chunk))
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
                    const rgpdRequest: RGPDRequest = {
                        requestType: formData.requestType,
                        userEmail: formData.userEmail,
                        requestDetails: formData.requestDetails,
                        identityConfirmed: formData.identityConfirmed === 'true',
                        processingConsent: formData.processingConsent === 'true',
                        attachments: attachments,
                    }

                    // Valider le type de demande
                    if (!REQUEST_TYPE_NAMES[rgpdRequest.requestType]) {
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
                    const requestTypeName = REQUEST_TYPE_NAMES[rgpdRequest.requestType]

                    // Envoyer l'email à l'équipe avec les pièces jointes
                    try {
                        await sendBrevoEmail(
                            brevoConfig.toEmail,
                            `Demande RGPD - ${requestTypeName} - ${trackingNumber}`,
                            createTeamEmailTemplate(rgpdRequest, trackingNumber),
                            attachments
                        )
                    } catch (emailError) {
                        console.error('Erreur envoi email équipe:', emailError)
                        throw emailError
                    }

                    // Envoyer l'email de confirmation à l'utilisateur
                    try {
                        await sendBrevoEmail(
                            rgpdRequest.userEmail,
                            `Confirmation - ${requestTypeName} - ${trackingNumber}`,
                            createUserConfirmationTemplate(rgpdRequest, trackingNumber)
                        )
                    } catch (emailError) {
                        console.error('Erreur envoi email confirmation:', emailError)
                        // On continue même si l'email de confirmation échoue
                    }

                    // Sauvegarder la demande dans Firestore
                    await admin
                        .firestore()
                        .collection('rgpd-requests')
                        .add({
                            ...rgpdRequest,
                            trackingNumber,
                            timestamp: admin.firestore.FieldValue.serverTimestamp(),
                            attachments: attachments.map((att) => ({
                                filename: att.filename,
                                contentType: att.contentType,
                                size: att.content.length,
                            })),
                        })

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
