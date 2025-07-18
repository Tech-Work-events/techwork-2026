import * as SibApiV3Sdk from '@getbrevo/brevo'
import { brevoApiInstance, brevoConfig } from '../config'

// Fonction utilitaire pour envoyer des emails avec Brevo
export async function sendBrevoEmail(
    to: string,
    subject: string,
    htmlContent: string,
    attachments: Array<{ filename: string; content: string; contentType: string }> = []
): Promise<void> {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

    sendSmtpEmail.sender = {
        name: brevoConfig.senderName,
        email: brevoConfig.senderEmail,
    }

    sendSmtpEmail.to = [{ email: to }]
    sendSmtpEmail.subject = subject
    sendSmtpEmail.htmlContent = htmlContent
    sendSmtpEmail.replyTo = {
        email: brevoConfig.replyToEmail,
        name: brevoConfig.senderName,
    }

    // Ajouter les pièces jointes si présentes
    if (attachments && attachments.length > 0) {
        sendSmtpEmail.attachment = attachments.map((att) => ({
            name: att.filename,
            content: att.content,
        }))
    }

    try {
        await brevoApiInstance.sendTransacEmail(sendSmtpEmail)
    } catch (error) {
        console.error(`Erreur lors de l'envoi email à ${to}:`, error)
        throw error
    }
}

// Fonction pour créer et envoyer un contact à Brevo
export async function createBrevoContact(email: string, source: string): Promise<void> {
    const contactsApi = new SibApiV3Sdk.ContactsApi()
    contactsApi.setApiKey(SibApiV3Sdk.ContactsApiApiKeys.apiKey, brevoConfig.apiKey)

    const createContact = new SibApiV3Sdk.CreateContact()
    createContact.email = email
    createContact.listIds = [brevoConfig.newsletterListId]
    createContact.attributes = {
        SOURCE: source || 'website',
        INSCRIPTION_DATE: new Date().toISOString(),
        OPTIN: 'true',
    } as any

    try {
        await contactsApi.createContact(createContact)
    } catch (brevoError: any) {
        console.error('Erreur Brevo:', brevoError)

        // Si le contact existe déjà, on le propage pour gestion dans la function
        if (
            brevoError.response &&
            brevoError.response.body &&
            brevoError.response.body.code === 'duplicate_parameter'
        ) {
            const error = new Error('Contact déjà existant')
            ;(error as any).code = 'DUPLICATE_CONTACT'
            throw error
        } else {
            throw brevoError
        }
    }
}
