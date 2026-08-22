import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Récupère les réglages, en crée une ligne vide si elle n'existe pas encore */
  async get() {
    const existing = await this.prisma.siteSettings.findFirst();
    if (existing) return existing;
    return this.prisma.siteSettings.create({ data: {} });
  }

  async update(data: {
    logoUrl?: string | null;
    faviconUrl?: string | null;
    heroTitle?: string | null;
    heroSubtitle?: string | null;
    brandSubtitle?: string | null;
    socialLinks?: { platform: string; url: string }[] | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    contactAddress?: string | null;
    footerText?: string | null;
    presentationContent?: { mission: string; vision: string; valeurs: string; pillars: { title: string; text: string }[] } | null;
  }) {
    const settings = await this.get();
    return this.prisma.siteSettings.update({ where: { id: settings.id }, data: data as any });
  }
}
