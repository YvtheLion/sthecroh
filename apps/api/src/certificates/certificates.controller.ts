import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'TEACHER')
  @Post('certificates')
  issueCertificate(@Body() body: { userId: string; title: string; courseName?: string }) {
    return this.certificatesService.issueCertificate(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('diplomas')
  issueDiploma(@Body() body: { userId: string; programId: string; mention?: string }) {
    return this.certificatesService.issueDiploma(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('certificates/me')
  myCertificates(@Req() req: { user: { userId: string } }) {
    return this.certificatesService.myCertificates(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('diplomas/me')
  myDiplomas(@Req() req: { user: { userId: string } }) {
    return this.certificatesService.myDiplomas(req.user.userId);
  }

  /** Téléchargement du PDF réel d'un certificat */
  @UseGuards(JwtAuthGuard)
  @Get('certificates/:id/pdf')
  async certificatePdf(
    @Req() req: { user: { userId: string; role: string } },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
    const pdf = await this.certificatesService.renderCertificatePdf(id, req.user.userId, isAdmin);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificat-${id}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.end(pdf);
  }

  /** Téléchargement du PDF réel d'un diplôme */
  @UseGuards(JwtAuthGuard)
  @Get('diplomas/:id/pdf')
  async diplomaPdf(
    @Req() req: { user: { userId: string; role: string } },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
    const pdf = await this.certificatesService.renderDiplomaPdf(id, req.user.userId, isAdmin);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="diplome-${id}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.end(pdf);
  }

  /** Vérification publique par identifiant humain (ex: STH-2026-0947) — utilisée par la boîte de
   *  recherche de la page d'accueil. Doit être déclarée avant 'verification/:token' pour éviter
   *  toute ambiguïté de routage. */
  @Get('verification/by-number/:no')
  verifyByNumber(@Param('no') no: string) {
    return this.certificatesService.verifyByNumber(no);
  }

  /** Vérification publique par token QR — accessible sans authentification, comme demandé */
  @Get('verification/:token')
  verify(@Param('token') token: string) {
    return this.certificatesService.verifyByToken(token);
  }
}
