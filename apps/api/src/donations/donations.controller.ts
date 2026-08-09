import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { DonationsService } from './donations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/all')
  findAllForAdmin() {
    return this.donationsService.findAllForAdmin();
  }

  @Get('causes')
  causes() {
    return this.donationsService.listCauses();
  }

  @Get('impact')
  impact() {
    return this.donationsService.impactStats();
  }

  @Post('checkout')
  checkout(
    @Body()
    body: {
      donorName?: string;
      donorEmail?: string;
      amountCents: number;
      currency?: string;
      causeId?: string;
      frequency: 'ONE_TIME' | 'MONTHLY';
    },
  ) {
    return this.donationsService.createDonationCheckout(body);
  }

  @Post('paypal/checkout')
  paypalCheckout(
    @Body() body: { donorName?: string; donorEmail?: string; amountCents: number; currency?: string; causeId?: string },
  ) {
    return this.donationsService.createPaypalDonationCheckout(body);
  }

  /** Retour PayPal après approbation du don — capture puis redirige vers la page de remerciement */
  @Get('paypal/capture')
  async capturePaypal(@Query('donationId') donationId: string, @Res() res: Response) {
    const result = await this.donationsService.capturePaypalDonation(donationId);
    const redirectUrl = result.success
      ? `${process.env.WEB_URL}/dons/merci`
      : `${process.env.WEB_URL}/#dons`;
    res.redirect(redirectUrl);
  }
}
