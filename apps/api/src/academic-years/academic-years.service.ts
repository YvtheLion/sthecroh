import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcademicYearsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.academicYear.findMany({ orderBy: { startDate: 'desc' } } as any);
  }

  async findOne(id: string) {
    const record = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Introuvable.');
    return record;
  }

  create(data: Record<string, unknown>) {
    return this.prisma.academicYear.create({ data } as any);
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.academicYear.update({ where: { id }, data } as any);
  }

  remove(id: string) {
    return this.prisma.academicYear.delete({ where: { id } });
  }
}
