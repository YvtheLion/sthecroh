import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SemestersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.semester.findMany({ orderBy: { startDate: 'desc' } } as any);
  }

  async findOne(id: string) {
    const record = await this.prisma.semester.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Introuvable.');
    return record;
  }

  create(data: Record<string, unknown>) {
    return this.prisma.semester.create({ data } as any);
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.semester.update({ where: { id }, data } as any);
  }

  remove(id: string) {
    return this.prisma.semester.delete({ where: { id } });
  }
}
