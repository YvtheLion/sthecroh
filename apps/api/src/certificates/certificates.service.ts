import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';

const GOLD = '#b8912f';
const ROYAL = '#131f66';
const INK = '#10152b';

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  private generateSecureToken() {
    return crypto.randomBytes(24).toString('hex');
  }

  private async buildQrDataUrl(verifyUrl: string) {
    return QRCode.toDataURL(verifyUrl, { margin: 1, width: 320 });
  }

  private async buildQrBuffer(verifyUrl: string): Promise<Buffer> {
    return QRCode.toBuffer(verifyUrl, { margin: 1, width: 240 });
  }

  /** Génère le PDF d'un certificat, avec QR code de vérification intégré */
  async renderCertificatePdf(certificateId: string, requesterId: string, isAdmin: boolean): Promise<Buffer> {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id: certificateId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    if (!certificate) throw new NotFoundException('Certificat introuvable.');
    if (!isAdmin && certificate.userId !== requesterId) {
      throw new ForbiddenException("Ce certificat ne vous appartient pas.");
    }

    const verifyUrl = `${process.env.WEB_URL}/verification/certificat/${certificate.qrToken}`;
    const qrBuffer = await this.buildQrBuffer(verifyUrl);

    return this.renderPdf((doc) => {
      doc.rect(24, 24, doc.page.width - 48, doc.page.height - 48).lineWidth(1.4).stroke(GOLD);
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).lineWidth(0.6).stroke(GOLD);

      doc.font('Helvetica-Bold').fontSize(11).fillColor(GOLD)
        .text('SÉMINAIRE THÉOLOGIQUE STHECROH', 0, 90, { align: 'center', characterSpacing: 2 });

      doc.font('Helvetica-Oblique').fontSize(28).fillColor(INK)
        .text('Certificat de réussite', 0, 130, { align: 'center' });

      doc.font('Helvetica').fontSize(12).fillColor('#555')
        .text('Ce document atteste que', 0, 195, { align: 'center' });

      doc.font('Helvetica-Bold').fontSize(24).fillColor(INK)
        .text(`${certificate.user.firstName} ${certificate.user.lastName}`, 0, 220, { align: 'center' });

      doc.font('Helvetica').fontSize(12.5).fillColor('#444')
        .text(
          `a suivi avec succès le programme « ${certificate.title} »${certificate.courseName && certificate.courseName !== certificate.title ? ` — ${certificate.courseName}` : ''}, ` +
            `délivré le ${certificate.issuedAt.toLocaleDateString('fr-FR')}, conformément aux exigences académiques de l'institution.`,
          90,
          270,
          { align: 'center', width: doc.page.width - 180 },
        );

      doc.font('Helvetica').fontSize(10).fillColor('#777')
        .text(`Identifiant du certificat : ${certificate.certificateNo}`, 0, 340, { align: 'center' });

      doc.image(qrBuffer, doc.page.width / 2 - 55, 380, { width: 110 });
      doc.font('Helvetica').fontSize(8.5).fillColor('#888')
        .text('Scannez pour vérifier l’authenticité de ce certificat', 0, 495, { align: 'center' });

      doc.font('Helvetica-Oblique').fontSize(11).fillColor(ROYAL)
        .text('Dr. Samuel Diarra — Directeur académique', 0, doc.page.height - 90, { align: 'center' });
    });
  }

  /** Génère le PDF d'un diplôme */
  async renderDiplomaPdf(diplomaId: string, requesterId: string, isAdmin: boolean): Promise<Buffer> {
    const diploma = await this.prisma.diploma.findUnique({
      where: { id: diplomaId },
      include: { user: { select: { firstName: true, lastName: true } }, program: true },
    });
    if (!diploma) throw new NotFoundException('Diplôme introuvable.');
    if (!isAdmin && diploma.userId !== requesterId) {
      throw new ForbiddenException("Ce diplôme ne vous appartient pas.");
    }

    const verifyUrl = `${process.env.WEB_URL}/verification/diplome/${diploma.qrToken}`;
    const qrBuffer = await this.buildQrBuffer(verifyUrl);

    return this.renderPdf((doc) => {
      doc.rect(24, 24, doc.page.width - 48, doc.page.height - 48).lineWidth(1.4).stroke(GOLD);
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).lineWidth(0.6).stroke(GOLD);

      doc.font('Helvetica-Bold').fontSize(11).fillColor(GOLD)
        .text('SÉMINAIRE THÉOLOGIQUE STHECROH', 0, 90, { align: 'center', characterSpacing: 2 });

      doc.font('Helvetica-Oblique').fontSize(28).fillColor(INK)
        .text('Diplôme', 0, 130, { align: 'center' });

      doc.font('Helvetica').fontSize(12).fillColor('#555')
        .text('Ce diplôme est décerné à', 0, 195, { align: 'center' });

      doc.font('Helvetica-Bold').fontSize(24).fillColor(INK)
        .text(`${diploma.user.firstName} ${diploma.user.lastName}`, 0, 220, { align: 'center' });

      doc.font('Helvetica').fontSize(12.5).fillColor('#444')
        .text(
          `pour avoir complété avec succès le programme « ${diploma.program.name} »` +
            `${diploma.mention ? ` avec la mention ${diploma.mention}` : ''}, ` +
            `délivré le ${diploma.issuedAt.toLocaleDateString('fr-FR')}.`,
          90,
          270,
          { align: 'center', width: doc.page.width - 180 },
        );

      doc.font('Helvetica').fontSize(10).fillColor('#777')
        .text(`Identifiant du diplôme : ${diploma.diplomaNo}`, 0, 340, { align: 'center' });

      doc.image(qrBuffer, doc.page.width / 2 - 55, 380, { width: 110 });
      doc.font('Helvetica').fontSize(8.5).fillColor('#888')
        .text('Scannez pour vérifier l’authenticité de ce diplôme', 0, 495, { align: 'center' });

      doc.font('Helvetica-Oblique').fontSize(11).fillColor(ROYAL)
        .text('Dr. Samuel Diarra — Directeur académique', 0, doc.page.height - 90, { align: 'center' });
    });
  }

  private renderPdf(draw: (doc: PDFKit.PDFDocument) => void): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      draw(doc);
      doc.end();
    });
  }

  async issueCertificate(params: { userId: string; title: string; courseName?: string }) {
    const year = new Date().getFullYear();
    const seq = (await this.prisma.certificate.count()) + 1;
    const certificateNo = `STH-${year}-${String(seq).padStart(4, '0')}`;
    const qrToken = this.generateSecureToken();

    const certificate = await this.prisma.certificate.create({
      data: {
        userId: params.userId,
        title: params.title,
        courseName: params.courseName,
        certificateNo,
        qrToken,
      },
    });

    const verifyUrl = `${process.env.WEB_URL}/verification/certificat/${qrToken}`;
    const qrDataUrl = await this.buildQrDataUrl(verifyUrl);

    // Le rendu PDF réel (mise en page, signature numérique, upload Cloudinary)
    // est effectué par un worker dédié — voir apps/api/src/certificates/pdf/README.md
    return { certificate, qrDataUrl, verifyUrl };
  }

  async issueDiploma(params: { userId: string; programId: string; mention?: string }) {
    const year = new Date().getFullYear();
    const seq = (await this.prisma.diploma.count()) + 1;
    const diplomaNo = `DIP-${year}-${String(seq).padStart(4, '0')}`;
    const qrToken = this.generateSecureToken();

    const diploma = await this.prisma.diploma.create({
      data: {
        userId: params.userId,
        programId: params.programId,
        diplomaNo,
        qrToken,
        mention: params.mention,
      },
    });

    const verifyUrl = `${process.env.WEB_URL}/verification/diplome/${qrToken}`;
    const qrDataUrl = await this.buildQrDataUrl(verifyUrl);

    return { diploma, qrDataUrl, verifyUrl };
  }

  async verifyByToken(token: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { qrToken: token },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    if (certificate) return { type: 'certificate' as const, record: certificate, valid: !certificate.revoked };

    const diploma = await this.prisma.diploma.findUnique({
      where: { qrToken: token },
      include: { user: { select: { firstName: true, lastName: true } }, program: true },
    });
    if (diploma) return { type: 'diploma' as const, record: diploma, valid: !diploma.revoked };

    throw new NotFoundException('Aucun certificat ou diplôme ne correspond à ce code.');
  }

  /** Vérification publique par identifiant humain (ex: STH-2026-0947), saisi manuellement */
  async verifyByNumber(no: string) {
    const cleaned = no.trim();

    const certificate = await this.prisma.certificate.findUnique({
      where: { certificateNo: cleaned },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    if (certificate) return { type: 'certificate' as const, record: certificate, valid: !certificate.revoked };

    const diploma = await this.prisma.diploma.findUnique({
      where: { diplomaNo: cleaned },
      include: { user: { select: { firstName: true, lastName: true } }, program: true },
    });
    if (diploma) return { type: 'diploma' as const, record: diploma, valid: !diploma.revoked };

    throw new NotFoundException("Aucun certificat ou diplôme ne correspond à cet identifiant.");
  }

  myCertificates(userId: string) {
    return this.prisma.certificate.findMany({ where: { userId }, orderBy: { issuedAt: 'desc' } });
  }

  myDiplomas(userId: string) {
    return this.prisma.diploma.findMany({ where: { userId }, orderBy: { issuedAt: 'desc' } });
  }
}
