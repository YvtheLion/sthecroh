import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, title: string, body?: string, type: 'INFO' | 'PAYMENT' | 'GRADE' | 'ANNOUNCEMENT' | 'SYSTEM' = 'INFO') {
    return this.prisma.notification.create({ data: { userId, title, body, type } });
  }

  forUser(userId: string) {
    return this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  markRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }
}
