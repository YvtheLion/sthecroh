import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params: { skip?: number; take?: number } = {}) {
    return this.prisma.exam.findMany({
      skip: params.skip ?? 0,
      take: params.take ?? 25,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.exam.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Exam introuvable.');
    return record;
  }

  create(data: Record<string, unknown>) {
    return this.prisma.exam.create({ data } as any);
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.exam.update({ where: { id }, data } as any);
  }

  remove(id: string) {
    return this.prisma.exam.delete({ where: { id } });
  }
}
