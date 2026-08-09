import { Injectable, InternalServerErrorException } from '@nestjs/common';

const PAYPAL_BASE = process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

@Injectable()
export class PaypalService {
  private assertConfigured() {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      throw new InternalServerErrorException(
        "PayPal n'est pas configuré (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET manquants dans .env). " +
          'Créez une application sur developer.paypal.com (mode Sandbox gratuit) pour tester.',
      );
    }
  }

  private async getAccessToken(): Promise<string> {
    this.assertConfigured();
    const credentials = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
    ).toString('base64');

    const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      throw new InternalServerErrorException("Échec de l'authentification PayPal.");
    }
    const data = await res.json();
    return data.access_token;
  }

  /** Crée une commande PayPal et renvoie le lien d'approbation vers lequel rediriger l'utilisateur */
  async createOrder(params: {
    amountCents: number;
    currency?: string;
    description: string;
    returnUrl: string;
    cancelUrl: string;
    referenceId: string;
  }): Promise<{ orderId: string; approveUrl: string }> {
    const token = await this.getAccessToken();
    const currency = (params.currency ?? 'USD').toUpperCase();

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: params.referenceId,
            description: params.description,
            amount: { currency_code: currency, value: (params.amountCents / 100).toFixed(2) },
          },
        ],
        application_context: {
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl,
          user_action: 'PAY_NOW',
          brand_name: 'STHECROH',
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new InternalServerErrorException(`Échec de création de la commande PayPal : ${body}`);
    }

    const data = await res.json();
    const approveLink = (data.links as { rel: string; href: string }[]).find((l) => l.rel === 'approve');
    if (!approveLink) throw new InternalServerErrorException("PayPal n'a renvoyé aucun lien d'approbation.");

    return { orderId: data.id, approveUrl: approveLink.href };
  }

  /** Capture (finalise) une commande PayPal approuvée par l'utilisateur */
  async captureOrder(orderId: string): Promise<{ success: boolean; referenceId?: string }> {
    const token = await this.getAccessToken();

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      return { success: false };
    }

    const data = await res.json();
    const referenceId = data.purchase_units?.[0]?.reference_id;
    const captureStatus = data.purchase_units?.[0]?.payments?.captures?.[0]?.status;

    return { success: captureStatus === 'COMPLETED', referenceId };
  }
}
