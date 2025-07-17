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
const SibApiV3Sdk = __importStar(require('@getbrevo/brevo'))
const cors_1 = __importDefault(require('cors'))
const busboy_1 = __importDefault(require('busboy'))
// Initialiser Firebase Admin
admin.initializeApp()
// Configuration Brevo via variables d'environnement
const brevoApiKey = process.env.BREVO_API_KEY || 'your-brevo-api-key'
const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@techwork.events'
const brevoToEmail = process.env.BREVO_TO_EMAIL || 'privacy@techwork.events'
const brevoReplyToEmail = process.env.BREVO_REPLY_TO_EMAIL || 'privacy@techwork.events'
// Initialiser Brevo API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, brevoApiKey)
// Configuration des emails
const emailConfig = {
    senderEmail: brevoSenderEmail,
    senderName: "Tech'Work Lyon",
    toEmail: brevoToEmail,
    replyToEmail: brevoReplyToEmail,
}
// Configurer CORS avec des origines spécifiques
const corsHandler = (0, cors_1.default)({
    origin: [
        'https://techwork.events',
        'https://www.techwork.events',
        'http://localhost:4321',
        'http://localhost:3000',
        'http://127.0.0.1:4321',
    ],
    credentials: true,
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
})
// Fonction utilitaire pour envoyer des emails avec Brevo
async function sendBrevoEmail(to, subject, htmlContent, attachments = []) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
    sendSmtpEmail.sender = {
        name: emailConfig.senderName,
        email: emailConfig.senderEmail,
    }
    sendSmtpEmail.to = [{ email: to }]
    sendSmtpEmail.subject = subject
    sendSmtpEmail.htmlContent = htmlContent
    sendSmtpEmail.replyTo = {
        email: emailConfig.replyToEmail,
        name: emailConfig.senderName,
    }
    // Ajouter les pièces jointes si présentes
    if (attachments && attachments.length > 0) {
        sendSmtpEmail.attachment = attachments.map((att) => ({
            name: att.filename,
            content: att.content,
        }))
    }
    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail)
    } catch (error) {
        console.error(`Erreur lors de l'envoi email à ${to}:`, error)
        throw error
    }
}
// Mapping des types de demande
const REQUEST_TYPE_NAMES = {
    access: "Droit d'accès",
    rectification: 'Droit de rectification',
    erasure: "Droit d'effacement",
    portability: 'Droit à la portabilité',
    opposition: "Droit d'opposition",
    limitation: 'Droit à la limitation',
    'consent-withdrawal': 'Retrait du consentement',
}
// Template d'email pour l'équipe
function createTeamEmailTemplate(request, trackingNumber) {
    const requestTypeName = REQUEST_TYPE_NAMES[request.requestType] || request.requestType
    const currentDate = new Date().toLocaleDateString('fr-FR')
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 24px;">🔒 Nouvelle demande RGPD</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Tech'Work Lyon - Système de traitement des demandes</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">📋 Informations de la demande</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Type de demande :</td>
            <td style="padding: 8px 0; color: #6b7280;">${requestTypeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email demandeur :</td>
            <td style="padding: 8px 0; color: #6b7280;">${request.userEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Date de demande :</td>
            <td style="padding: 8px 0; color: #6b7280;">${currentDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Numéro de suivi :</td>
            <td style="padding: 8px 0; color: #3b82f6; font-weight: bold;">${trackingNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Attestations :</td>
            <td style="padding: 8px 0; color: #10b981;">✅ Identité confirmée<br>✅ Consentement traitement</td>
          </tr>
        </table>
      </div>
      
      <div style="background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1f2937; margin-top: 0;">📝 Détails de la demande</h3>
        <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; line-height: 1.6; color: #374151;">${request.requestDetails}</p>
        </div>
      </div>
      
      ${
          request.attachments && request.attachments.length > 0
              ? `
        <div style="background: #fff7ed; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #ea580c; margin-top: 0;">📎 Pièces jointes</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${request.attachments.map((att) => `<li style="color: #9a3412; margin: 5px 0;">${att.filename} (${((att.content.length * 3) / 4 / 1024).toFixed(1)} KB)</li>`).join('')}
          </ul>
        </div>
      `
              : ''
      }
      
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1d4ed8; margin-top: 0;">⏰ Délai de traitement</h3>
        <p style="margin: 0; color: #1e40af;"><strong>Délai légal :</strong> 1 mois à compter de la réception</p>
        <p style="margin: 8px 0 0 0; color: #1e40af;"><strong>Date limite :</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}</p>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          📧 Demande générée automatiquement depuis le site Tech'Work Lyon<br>
          Pour toute question, contactez : <a href="mailto:contact@techwork.lyon" style="color: #3b82f6;">contact@techwork.lyon</a>
        </p>
      </div>
    </div>
  `
}
// Template d'email de confirmation pour l'utilisateur
function createUserConfirmationTemplate(request, trackingNumber) {
    const requestTypeName = REQUEST_TYPE_NAMES[request.requestType] || request.requestType
    const currentDate = new Date().toLocaleDateString('fr-FR')
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 24px;">✅ Demande RGPD reçue</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Tech'Work Lyon - Confirmation de réception</p>
      </div>
      
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #15803d; margin-top: 0;">🎉 Votre demande a été transmise avec succès</h2>
        <p style="margin: 0; color: #166534; line-height: 1.6;">
          Nous avons bien reçu votre demande concernant vos données personnelles. 
          Notre équipe va la traiter dans les meilleurs délais.
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1f2937; margin-top: 0;">📋 Récapitulatif de votre demande</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Type de demande :</td>
            <td style="padding: 8px 0; color: #6b7280;">${requestTypeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Date de soumission :</td>
            <td style="padding: 8px 0; color: #6b7280;">${currentDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Numéro de suivi :</td>
            <td style="padding: 8px 0; color: #3b82f6; font-weight: bold;">${trackingNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email de contact :</td>
            <td style="padding: 8px 0; color: #6b7280;">${request.userEmail}</td>
          </tr>
        </table>
      </div>
      
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1d4ed8; margin-top: 0;">⏰ Délai de traitement</h3>
        <p style="margin: 0; color: #1e40af; line-height: 1.6;">
          <strong>Délai légal :</strong> 1 mois maximum<br>
          <strong>Réponse attendue avant le :</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}<br>
          <strong>Accusé de réception :</strong> Ce message (immédiat)
        </p>
      </div>
      
      <div style="background: #f0f9ff; border: 1px solid #7dd3fc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #0369a1; margin-top: 0;">🔍 Numéro de suivi</h3>
        <div style="background: white; padding: 15px; border-radius: 6px; border: 2px solid #3b82f6; text-align: center;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1e40af;">${trackingNumber}</p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">Conservez ce numéro pour toute correspondance future</p>
        </div>
      </div>
      
      <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #92400e; margin-top: 0;">💡 Que se passe-t-il maintenant ?</h3>
        <ol style="margin: 0; padding-left: 20px; color: #92400e; line-height: 1.6;">
          <li>Votre demande est transmise à notre délégué à la protection des données</li>
          <li>Nous vérifions votre identité si nécessaire</li>
          <li>Nous traitons votre demande selon le type choisi</li>
          <li>Vous recevrez notre réponse complète par email</li>
        </ol>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          📧 Pour toute question : <a href="mailto:privacy@techwork.lyon" style="color: #3b82f6;">privacy@techwork.lyon</a><br>
          🌐 Plus d'informations : <a href="https://techwork.lyon/legal/droits-utilisateurs" style="color: #3b82f6;">Page des droits utilisateurs</a>
        </p>
      </div>
    </div>
  `
}
// Function pour traiter les demandes RGPD
exports.processRGPDRequest = functions.https.onRequest((request, response) => {
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
            const busboy = (0, busboy_1.default)({ headers: request.headers })
            const formData = {}
            const attachments = []
            busboy.on('field', (fieldname, val) => {
                formData[fieldname] = val
            })
            busboy.on('file', (fieldname, file, info) => {
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
                    if (!REQUEST_TYPE_NAMES[rgpdRequest.requestType]) {
                        response.status(400).json({ error: 'Type de demande invalide' })
                        return
                    }
                    // Valider l'email
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (!emailRegex.test(rgpdRequest.userEmail)) {
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
                            emailConfig.toEmail,
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
                    // Sauvegarder la demande dans Firestore (optionnel)
                    await admin
                        .firestore()
                        .collection('rgpd-requests')
                        .add(
                            Object.assign(Object.assign({}, rgpdRequest), {
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
//# sourceMappingURL=index.js.map
