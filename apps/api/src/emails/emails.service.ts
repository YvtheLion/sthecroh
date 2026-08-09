import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

const FROM = 'STHECROH <onboarding@resend.dev>'; // à remplacer par un domaine vérifié en production

@Injectable()
export class EmailsService {
  private readonly logger = new Logger('EmailsService');
  private resend: Resend | null = null;

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  /** Envoie un e-mail ; n'échoue jamais bruyamment si Resend n'est pas configuré (log seulement) */
  private async send(params: { to: string; subject: string; html: string }) {
    if (!this.resend) {
      this.logger.warn(
        `RESEND_API_KEY absent — e-mail non envoyé (destinataire : ${params.to}, sujet : "${params.subject}").`,
      );
      return { sent: false };
    }
    try {
      await this.resend.emails.send({ from: FROM, to: params.to, subject: params.subject, html: params.html });
      return { sent: true };
    } catch (err) {
      this.logger.error(`Échec d'envoi d'e-mail à ${params.to} : ${(err as Error).message}`);
      return { sent: false };
    }
  }

  sendVerificationEmail(to: string, firstName: string, verifyUrl: string) {
    return this.send({
      to,
      subject: 'Confirmez votre adresse e-mail — STHECROH',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#131f66;">Bienvenue, ${firstName} 👋</h2>
          <p>Merci de vous être inscrit(e) sur STHECROH. Confirmez votre adresse e-mail pour activer votre compte :</p>
          <p><a href="${verifyUrl}" style="background:#2c44b8;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;display:inline-block;">Confirmer mon e-mail</a></p>
          <p style="color:#888;font-size:13px;">Si le bouton ne fonctionne pas, copiez ce lien : ${verifyUrl}</p>
        </div>
      `,
    });
  }

  sendPaymentReceipt(to: string, firstName: string, amountCents: number, currency: string, description: string) {
    return this.send({
      to,
      subject: 'Reçu de paiement — STHECROH',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#131f66;">Paiement confirmé</h2>
          <p>Bonjour ${firstName},</p>
          <p>Nous confirmons la réception de votre paiement :</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px 0;color:#666;">Description</td><td style="padding:8px 0;text-align:right;font-weight:600;">${description}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Montant</td><td style="padding:8px 0;text-align:right;font-weight:600;">${(amountCents / 100).toFixed(2)} ${currency}</td></tr>
          </table>
          <p style="color:#888;font-size:13px;">Merci de votre confiance. — L'équipe STHECROH</p>
        </div>
      `,
    });
  }

  sendDonationReceipt(to: string, donorName: string, amountCents: number, currency: string) {
    return this.send({
      to,
      subject: 'Merci pour votre don — STHECROH',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#b8912f;">Merci pour votre générosité 🙏</h2>
          <p>Cher(e) ${donorName},</p>
          <p>Votre don de <b>${(amountCents / 100).toFixed(2)} ${currency}</b> a bien été reçu.</p>
          <p>Votre contribution aide directement à former la prochaine génération de serviteurs.</p>
          <p style="color:#888;font-size:13px;">Ce message vaut reçu pour votre don. — L'équipe STHECROH</p>
        </div>
      `,
    });
  }
}
