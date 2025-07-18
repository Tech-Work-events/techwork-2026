import * as admin from 'firebase-admin'
import * as SibApiV3Sdk from '@getbrevo/brevo'
import cors from 'cors'

// Initialiser Firebase Admin
admin.initializeApp()

// Configuration Brevo via variables d'environnement
export const brevoConfig = {
    apiKey: process.env.BREVO_API_KEY || 'your-brevo-api-key',
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@techwork.events',
    toEmail: process.env.BREVO_TO_EMAIL || 'privacy@techwork.events',
    replyToEmail: process.env.BREVO_REPLY_TO_EMAIL || 'privacy@techwork.events',
    senderName: "Tech'Work Lyon",
    newsletterListId: 2, // ID de la liste newsletter
}

// Initialiser Brevo API
export const brevoApiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
brevoApiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, brevoConfig.apiKey)

// Configuration CORS
export const corsHandler = cors({
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

// Types
export interface RGPDRequest {
    requestType: string
    userEmail: string
    requestDetails: string
    identityConfirmed: boolean
    processingConsent: boolean
    attachments?: Array<{
        filename: string
        content: string
        contentType: string
    }>
}

export interface NewsletterRequest {
    email: string
    source: string
}
