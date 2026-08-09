import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailsService } from '../emails/emails.service';
import { PaypalService } from '../paypal/paypal.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly emails: EmailsService,
    private readonly paypal: PaypalService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2024-06-20',
    });
  }

  /** Crée une session de paiement Stripe pour des frais de scolarité, un cours, etc. */
  async createStripeCheckout(params: {
    userId: string;
    amountCents: number;
    currency?: string;
    description: string;
  }) {
    const payment = await this.prisma.payment.create({
      data: {
        userId: params.userId,
        amountCents: params.amountCents,
        currency: params.currency ?? 'USD',
        provider: 'STRIPE',
        status: 'PENDING',
        description: params.description,
      },
    });

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: params.currency ?? 'usd',
            product_data: { name: params.description },
            unit_amount: params.amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: { paymentId: payment.id },
      success_url: `${process.env.WEB_URL}/dashboard/student/payments?success=1`,
      cancel_url: `${process.env.WEB_URL}/dashboard/student/payments?canceled=1`,
    });

    return { checkoutUrl: session.url, paymentId: payment.id };
  }

  /** Crée une commande PayPal pour des frais de scolarité */
  async createPaypalCheckout(params: { userId: string; amountCents: number; currency?: string; description: string }) {
    const payment = await this.prisma.payment.create({
      data: {
        userId: params.userId,
        amountCents: params.amountCents,
        currency: params.currency ?? 'USD',
        provider: 'PAYPAL',
        status: 'PENDING',
        description: params.description,
      },
    });

    const { orderId, approveUrl } = await this.paypal.createOrder({
      amountCents: params.amountCents,
      currency: params.currency,
      description: params.description,
      referenceId: payment.id,
      returnUrl: `${process.env.API_URL}/api/v1/payments/paypal/capture?paymentId=${payment.id}`,
      cancelUrl: `${process.env.WEB_URL}/dashboard/student/payments?canceled=1`,
    });

    await this.prisma.payment.update({ where: { id: payment.id }, data: { providerRef: orderId } });

    return { approveUrl, paymentId: payment.id };
  }

  /** Capture une commande PayPal approuvée, puis marque le paiement comme réussi */
  async capturePaypalPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment || !payment.providerRef) return { success: false };

    const result = await this.paypal.captureOrder(payment.providerRef);
    if (result.success) {
      await this.markSucceeded(paymentId, payment.providerRef);
    } else {
      await this.markFailed(paymentId);
    }
    return result;
  }

  /** Récupère le lien du reçu hébergé par Stripe pour un PaymentIntent donné */
  async fetchReceiptUrl(paymentIntentId: string): Promise<string | undefined> {
    try {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['latest_charge'],
      });
      const charge = intent.latest_charge;
      if (charge && typeof charge !== 'string') {
        return charge.receipt_url ?? undefined;
      }
    } catch {
      // Pas bloquant : le paiement est déjà marqué comme réussi même sans reçu récupéré.
    }
    return undefined;
  }

  /** Appelé par le webhook Stripe (`checkout.session.completed`) */
  async markSucceeded(paymentId: string, providerRef: string, receiptUrl?: string) {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'SUCCEEDED', providerRef, receiptUrl },
      include: { user: { select: { email: true, firstName: true } } },
    });

    await this.notifications.create(
      payment.userId,
      'Paiement confirmé',
      `Votre paiement de ${(payment.amountCents / 100).toFixed(2)} ${payment.currency} a bien été reçu.`,
      'PAYMENT',
    );

    await this.emails.sendPaymentReceipt(
      payment.user.email,
      payment.user.firstName,
      payment.amountCents,
      payment.currency,
      payment.description ?? 'Paiement STHECROH',
    );

    await this.prisma.activityLog.create({
      data: {
        userId: payment.userId,
        action: 'PAYMENT_SUCCEEDED',
        metadata: { amountCents: payment.amountCents, currency: payment.currency, provider: payment.provider },
      },
    });

    return payment;
  }

  async markFailed(paymentId: string) {
    return this.prisma.payment.update({ where: { id: paymentId }, data: { status: 'FAILED' } });
  }

  /** Enregistre un paiement Mobile Money initié côté client (Orange/MTN/Airtel) */
  async recordMobileMoneyPayment(params: {
    userId: string;
    amountCents: number;
    provider: 'ORANGE_MONEY' | 'MTN_MOMO' | 'AIRTEL_MONEY';
    providerRef: string;
    description: string;
  }) {
    return this.prisma.payment.create({
      data: {
        userId: params.userId,
        amountCents: params.amountCents,
        currency: 'USD',
        provider: params.provider,
        providerRef: params.providerRef,
        status: 'PENDING', // confirmé ensuite via callback opérateur
        description: params.description,
      },
    });
  }

  findForUser(userId: string) {
    return this.prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  /** Admin — vue d'ensemble de tous les paiements, tous étudiants confondus */
  findAllForAdmin() {
    return this.prisma.payment.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  verifyStripeSignature(rawBody: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? '',
    );
  }
}
