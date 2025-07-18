import type { RGPDRequest } from '../config'

// Mapping des types de demande
export const REQUEST_TYPE_NAMES: { [key: string]: string } = {
    access: "Droit d'accès",
    rectification: 'Droit de rectification',
    erasure: "Droit d'effacement",
    portability: 'Droit à la portabilité',
    opposition: "Droit d'opposition",
    limitation: 'Droit à la limitation',
    'consent-withdrawal': 'Retrait du consentement',
}

// Template d'email pour l'équipe
export function createTeamEmailTemplate(request: RGPDRequest, trackingNumber: string): string {
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
export function createUserConfirmationTemplate(request: RGPDRequest, trackingNumber: string): string {
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
