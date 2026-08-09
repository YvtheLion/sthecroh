import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FaqItemsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public : uniquement le contenu publié, dans l'ordre d'affichage */
  findPublished() {
    return this.prisma.faqItem.findMany({
      where: { published: true },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /** Admin : tout le contenu, publié ou non */
  findAll() {
    return this.prisma.faqItem.findMany({ orderBy: [{ position: 'asc' }, { createdAt: 'desc' }] });
  }

  async findOne(id: string) {
    const record = await this.prisma.faqItem.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Introuvable.');
    return record;
  }

  create(data: Record<string, unknown>) {
    return this.prisma.faqItem.create({ data } as any);
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.faqItem.update({ where: { id }, data } as any);
  }

  remove(id: string) {
    return this.prisma.faqItem.delete({ where: { id } });
  }
}
