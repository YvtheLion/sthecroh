import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params: { skip?: number; take?: number } = {}) {
    return this.prisma.department.findMany({
      skip: params.skip ?? 0,
      take: params.take ?? 25,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.department.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Department introuvable.');
    return record;
  }

  create(data: Record<string, unknown>) {
    return this.prisma.department.create({ data } as any);
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.department.update({ where: { id }, data } as any);
  }

  remove(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }
}
