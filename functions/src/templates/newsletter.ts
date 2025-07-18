// Template d'email de bienvenue newsletter
export function createNewsletterWelcomeTemplate(): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 24px;">🎉 Bienvenue dans la newsletter !</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Tech'Work Lyon - Restez connecté·e·s !</p>
      </div>
      
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #15803d; margin-top: 0;">🚀 Vous êtes maintenant inscrit·e !</h2>
        <p style="margin: 0; color: #166534; line-height: 1.6;">
          Merci de vous être inscrit·e à notre newsletter ! Vous recevrez bientôt toutes les actualités 
          de Tech'Work Lyon : annonces importantes, early bird tickets, et bien plus encore.
        </p>
      </div>
      
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1d4ed8; margin-top: 0;">📧 Ce que vous recevrez</h3>
        <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
          <li>Annonces du lieu et des dates</li>
          <li>Accès prioritaire aux billets Early Bird</li>
          <li>Présentation des speakers et du programme</li>
          <li>Actualités de l'écosystème tech lyonnais</li>
        </ul>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          🌐 Suivez-nous aussi sur nos réseaux sociaux<br>
          📧 Questions ? Contactez-nous : <a href="mailto:contact@techwork.lyon" style="color: #3b82f6;">contact@techwork.lyon</a>
        </p>
      </div>
    </div>
    `
}
