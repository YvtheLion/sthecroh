import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { name: string; email: string; subject?: string; message: string }) {
    return this.prisma.contactMessage.create({ data });
  }

  findAll() {
    return this.prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async markHandled(id: string, handled: boolean) {
    const record = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Message introuvable.');
    return this.prisma.contactMessage.update({ where: { id }, data: { handled } });
  }

  remove(id: string) {
    return this.prisma.contactMessage.delete({ where: { id } });
  }
}
