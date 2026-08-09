import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GalleryImagesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public : uniquement le contenu publié, dans l'ordre d'affichage */
  findPublished() {
    return this.prisma.galleryImage.findMany({
      where: { published: true },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /** Admin : tout le contenu, publié ou non */
  findAll() {
    return this.prisma.galleryImage.findMany({ orderBy: [{ position: 'asc' }, { createdAt: 'desc' }] });
  }

  async findOne(id: string) {
    const record = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Introuvable.');
    return record;
  }

  create(data: Record<string, unknown>) {
    return this.prisma.galleryImage.create({ data } as any);
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.galleryImage.update({ where: { id }, data } as any);
  }

  remove(id: string) {
    return this.prisma.galleryImage.delete({ where: { id } });
  }
}
