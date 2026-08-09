import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params: { skip?: number; take?: number } = {}) {
    return this.prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      skip: params.skip ?? 0,
      take: params.take ?? 25,
      orderBy: { createdAt: 'desc' },
      include: { teacher: { select: { firstName: true, lastName: true } } },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.course.findUnique({
      where: { id },
      include: {
        teacher: { select: { firstName: true, lastName: true } },
        modules: { include: { lessons: true }, orderBy: { position: 'asc' } },
      },
    });
    if (!record) throw new NotFoundException('Course introuvable.');
    return record;
  }

  create(data: Record<string, unknown>) {
    return this.prisma.course.create({ data } as any);
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.course.update({ where: { id }, data } as any);
  }

  remove(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }
}
