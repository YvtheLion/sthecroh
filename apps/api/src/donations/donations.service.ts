import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { EmailsService } from '../emails/emails.service';
import { PaypalService } from '../paypal/paypal.service';

@Injectable()
export class DonationsService {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emails: EmailsService,
    private readonly paypal: PaypalService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2024-06-20' });
  }

  listCauses() {
    return this.prisma.donationCause.findMany({ where: { isActive: true } });
  }

  /** Admin — vue d'ensemble de tous les dons reçus */
  findAllForAdmin() {
    return this.prisma.donation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  /** Compteur d'impact global affiché sur la page publique des dons */
  async impactStats() {
    const [totalRaised, donorCount, causesFunded] = await Promise.all([
      this.prisma.donation.aggregate({
        _sum: { amountCents: true },
        where: { status: 'SUCCEEDED' },
      }),
      this.prisma.donation.groupBy({ by: ['donorEmail'], where: { status: 'SUCCEEDED' } }),
      this.prisma.donationCause.count({ where: { isActive: true } }),
    ]);
    return {
      totalRaisedCents: totalRaised._sum.amountCents ?? 0,
      donorCount: donorCount.length,
      causesFunded,
    };
  }

  async createDonationCheckout(params: {
    donorId?: string;
    donorName?: string;
    donorEmail?: string;
    amountCents: number;
    currency?: string;
    causeId?: string;
    frequency: 'ONE_TIME' | 'MONTHLY';
  }) {
    const donation = await this.prisma.donation.create({
      data: {
        donorId: params.donorId,
        donorName: params.donorName,
        donorEmail: params.donorEmail,
        amountCents: params.amountCents,
        currency: params.currency ?? 'USD',
        causeId: params.causeId,
        frequency: params.frequency,
        provider: 'STRIPE',
        status: 'PENDING',
      },
    });

    const session = await this.stripe.checkout.sessions.create({
      mode: params.frequency === 'MONTHLY' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: (params.currency ?? 'usd').toLowerCase(),
            product_data: { name: 'Don — STHECROH' },
            unit_amount: params.amountCents,
            ...(params.frequency === 'MONTHLY' ? { recurring: { interval: 'month' as const } } : {}),
          },
          quantity: 1,
        },
      ],
      metadata: { donationId: donation.id },
      customer_email: params.donorEmail,
      success_url: `${process.env.WEB_URL}/dons/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.WEB_URL}/#dons`,
    });

    return { checkoutUrl: session.url, donationId: donation.id };
  }

  /** Crée une commande PayPal pour un don ponctuel (les dons mensuels restent réservés à Stripe,
   *  qui gère nativement les abonnements — PayPal nécessiterait une API d'abonnement séparée). */
  async createPaypalDonationCheckout(params: {
    donorName?: string;
    donorEmail?: string;
    amountCents: number;
    currency?: string;
    causeId?: string;
  }) {
    const donation = await this.prisma.donation.create({
      data: {
        donorName: params.donorName,
        donorEmail: params.donorEmail,
        amountCents: params.amountCents,
        currency: params.currency ?? 'USD',
        causeId: params.causeId,
        frequency: 'ONE_TIME',
        provider: 'PAYPAL',
        status: 'PENDING',
      },
    });

    const { orderId, approveUrl } = await this.paypal.createOrder({
      amountCents: params.amountCents,
      currency: params.currency,
      description: 'Don — STHECROH',
      referenceId: donation.id,
      returnUrl: `${process.env.API_URL}/api/v1/donations/paypal/capture?donationId=${donation.id}`,
      cancelUrl: `${process.env.WEB_URL}/#dons`,
    });

    await this.prisma.donation.update({ where: { id: donation.id }, data: { providerRef: orderId } });

    return { approveUrl, donationId: donation.id };
  }

  /** Capture une commande PayPal de don approuvée, puis confirme le don */
  async capturePaypalDonation(donationId: string) {
    const donation = await this.prisma.donation.findUnique({ where: { id: donationId } });
    if (!donation || !donation.providerRef) return { success: false };

    const result = await this.paypal.captureOrder(donation.providerRef);
    if (result.success) {
      await this.confirmDonation(donationId, donation.providerRef);
    } else {
      await this.prisma.donation.update({ where: { id: donationId }, data: { status: 'FAILED' } });
    }
    return result;
  }

  /** Appelé par le webhook Stripe une fois le paiement confirmé */
  async confirmDonation(donationId: string, providerRef: string) {
    const donation = await this.prisma.donation.update({
      where: { id: donationId },
      data: { status: 'SUCCEEDED', providerRef },
    });

    if (donation.causeId) {
      await this.prisma.donationCause.update({
        where: { id: donation.causeId },
        data: { raisedCents: { increment: donation.amountCents } },
      });
    }

    if (donation.donorEmail) {
      await this.emails.sendDonationReceipt(
        donation.donorEmail,
        donation.donorName ?? 'Cher donateur',
        donation.amountCents,
        donation.currency,
      );
    }
    await this.prisma.donation.update({ where: { id: donationId }, data: { receiptSent: !!donation.donorEmail } });

    return donation;
  }
}
