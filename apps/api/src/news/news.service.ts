import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsPostsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public : uniquement le contenu publié, dans l'ordre d'affichage */
  findPublished() {
    return this.prisma.newsPost.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
    });
  }

  /** Admin : tout le contenu, publié ou non */
  findAll() {
    return this.prisma.newsPost.findMany({ orderBy: { date: 'desc' } });
  }

  async findOne(id: string) {
    const record = await this.prisma.newsPost.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Introuvable.');
    return record;
  }

  create(data: Record<string, unknown>) {
    return this.prisma.newsPost.create({ data } as any);
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.newsPost.update({ where: { id }, data } as any);
  }

  remove(id: string) {
    return this.prisma.newsPost.delete({ where: { id } });
  }
}
