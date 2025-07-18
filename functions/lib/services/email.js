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
exports.sendBrevoEmail = sendBrevoEmail
exports.createBrevoContact = createBrevoContact
const SibApiV3Sdk = __importStar(require('@getbrevo/brevo'))
const config_1 = require('../config')
// Fonction utilitaire pour envoyer des emails avec Brevo
async function sendBrevoEmail(to, subject, htmlContent, attachments = []) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
    sendSmtpEmail.sender = {
        name: config_1.brevoConfig.senderName,
        email: config_1.brevoConfig.senderEmail,
    }
    sendSmtpEmail.to = [{ email: to }]
    sendSmtpEmail.subject = subject
    sendSmtpEmail.htmlContent = htmlContent
    sendSmtpEmail.replyTo = {
        email: config_1.brevoConfig.replyToEmail,
        name: config_1.brevoConfig.senderName,
    }
    // Ajouter les pièces jointes si présentes
    if (attachments && attachments.length > 0) {
        sendSmtpEmail.attachment = attachments.map((att) => ({
            name: att.filename,
            content: att.content,
        }))
    }
    try {
        await config_1.brevoApiInstance.sendTransacEmail(sendSmtpEmail)
    } catch (error) {
        console.error(`Erreur lors de l'envoi email à ${to}:`, error)
        throw error
    }
}
// Fonction pour créer et envoyer un contact à Brevo
async function createBrevoContact(email, source) {
    const contactsApi = new SibApiV3Sdk.ContactsApi()
    contactsApi.setApiKey(SibApiV3Sdk.ContactsApiApiKeys.apiKey, config_1.brevoConfig.apiKey)
    const createContact = new SibApiV3Sdk.CreateContact()
    createContact.email = email
    createContact.listIds = [config_1.brevoConfig.newsletterListId]
    createContact.attributes = {
        SOURCE: source || 'website',
        INSCRIPTION_DATE: new Date().toISOString(),
        OPTIN: 'true',
    }
    try {
        await contactsApi.createContact(createContact)
    } catch (brevoError) {
        console.error('Erreur Brevo:', brevoError)
        // Si le contact existe déjà, on le propage pour gestion dans la function
        if (
            brevoError.response &&
            brevoError.response.body &&
            brevoError.response.body.code === 'duplicate_parameter'
        ) {
            const error = new Error('Contact déjà existant')
            error.code = 'DUPLICATE_CONTACT'
            throw error
        } else {
            throw brevoError
        }
    }
}
//# sourceMappingURL=email.js.map
