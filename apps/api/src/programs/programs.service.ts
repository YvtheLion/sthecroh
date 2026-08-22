import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params: { skip?: number; take?: number } = {}) {
    return this.prisma.program.findMany({
      skip: params.skip ?? 0,
      take: params.take ?? 25,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.program.findUnique({ where: { id }, include: { department: true } });
    if (!record) throw new NotFoundException('Program introuvable.');
    return record;
  }

  create(data: Record<string, unknown>) {
    return this.prisma.program.create({ data } as any);
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.program.update({ where: { id }, data } as any);
  }

  remove(id: string) {
    return this.prisma.program.delete({ where: { id } });
  }
}
