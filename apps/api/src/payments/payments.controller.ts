import {
  Body, Controller, Get, Headers, Post, Query, RawBodyRequest, Req, Res, UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get()
  findAllForAdmin() {
    return this.paymentsService.findAllForAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  createCheckout(
    @Req() req: { user: { userId: string } },
    @Body() body: { amountCents: number; currency?: string; description: string },
  ) {
    return this.paymentsService.createStripeCheckout({ userId: req.user.userId, ...body });
  }

  @UseGuards(JwtAuthGuard)
  @Post('paypal/checkout')
  createPaypalCheckout(
    @Req() req: { user: { userId: string } },
    @Body() body: { amountCents: number; currency?: string; description: string },
  ) {
    return this.paymentsService.createPaypalCheckout({ userId: req.user.userId, ...body });
  }

  /** Retour PayPal après approbation par l'utilisateur — capture puis redirige vers le tableau de bord */
  @Get('paypal/capture')
  async capturePaypal(@Query('paymentId') paymentId: string, @Res() res: Response) {
    const result = await this.paymentsService.capturePaypalPayment(paymentId);
    const redirectUrl = result.success
      ? `${process.env.WEB_URL}/dashboard/student/payments?success=1`
      : `${process.env.WEB_URL}/dashboard/student/payments?canceled=1`;
    res.redirect(redirectUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mobile-money')
  recordMobileMoney(
    @Req() req: { user: { userId: string } },
    @Body() body: {
      amountCents: number;
      provider: 'ORANGE_MONEY' | 'MTN_MOMO' | 'AIRTEL_MONEY';
      providerRef: string;
      description: string;
    },
  ) {
    return this.paymentsService.recordMobileMoneyPayment({ userId: req.user.userId, ...body });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  myPayments(@Req() req: { user: { userId: string } }) {
    return this.paymentsService.findForUser(req.user.userId);
  }

  /** Webhook Stripe — nécessite le body brut (configuré dans main.ts pour cette route) */
  @Post('webhooks/stripe')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = this.paymentsService.verifyStripeSignature(req.rawBody as Buffer, signature);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as { metadata?: { paymentId?: string }; payment_intent?: string };
      const paymentId = session.metadata?.paymentId;
      if (paymentId && session.payment_intent) {
        const receiptUrl = await this.paymentsService.fetchReceiptUrl(session.payment_intent);
        await this.paymentsService.markSucceeded(paymentId, session.payment_intent, receiptUrl);
      }
    }
    return { received: true };
  }
}
