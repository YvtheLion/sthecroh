import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Contacts autorisés selon le rôle : étudiant → ses enseignants ; enseignant → ses étudiants */
  async contacts(userId: string, role: string) {
    if (role === 'STUDENT') {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { studentId: userId },
        include: { course: { include: { teacher: { select: { id: true, firstName: true, lastName: true } } } } },
      });
      const map = new Map<string, { id: string; firstName: string; lastName: string }>();
      enrollments.forEach((e) => map.set(e.course.teacher.id, e.course.teacher));
      return Array.from(map.values());
    }

    if (role === 'TEACHER') {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { course: { teacherId: userId } },
        include: { student: { select: { id: true, firstName: true, lastName: true } } },
      });
      const map = new Map<string, { id: string; firstName: string; lastName: string }>();
      enrollments.forEach((e) => map.set(e.student.id, e.student));
      return Array.from(map.values());
    }

    return [];
  }

  async conversations(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { recipientId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
        recipient: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const byPartner = new Map<string, { partner: { id: string; firstName: string; lastName: string }; lastBody: string; lastAt: Date; unread: number }>();

    for (const m of messages) {
      const partner = m.senderId === userId ? m.recipient : m.sender;
      const existing = byPartner.get(partner.id);
      const isUnread = m.recipientId === userId && !m.readAt;
      if (!existing) {
        byPartner.set(partner.id, { partner, lastBody: m.body, lastAt: m.createdAt, unread: isUnread ? 1 : 0 });
      } else if (isUnread) {
        existing.unread += 1;
      }
    }

    return Array.from(byPartner.values()).sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
  }

  async thread(userId: string, partnerId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: partnerId },
          { senderId: partnerId, recipientId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    await this.prisma.message.updateMany({
      where: { senderId: partnerId, recipientId: userId, readAt: null },
      data: { readAt: new Date() },
    });

    return messages;
  }

  async send(senderId: string, senderRole: string, recipientId: string, body: string) {
    const contacts = await this.contacts(senderId, senderRole);
    const isAdmin = senderRole === 'ADMIN' || senderRole === 'SUPER_ADMIN';
    if (!isAdmin && !contacts.some((c) => c.id === recipientId)) {
      throw new ForbiddenException("Vous ne pouvez contacter que les enseignants ou étudiants de vos cours.");
    }
    const message = await this.prisma.message.create({ data: { senderId, recipientId, body } });

    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
      select: { firstName: true, lastName: true },
    });
    await this.notifications.create(
      recipientId,
      'Nouveau message',
      sender ? `${sender.firstName} ${sender.lastName} vous a envoyé un message.` : 'Vous avez reçu un nouveau message.',
      'INFO',
    );

    return message;
  }
}
