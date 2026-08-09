import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Enseignant — publie une annonce pour un cours dont il est bien responsable */
  async create(teacherId: string, courseId: string, title: string, body: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new ForbiddenException('Cours introuvable.');
    if (course.teacherId !== teacherId) throw new ForbiddenException("Ce cours ne vous appartient pas.");

    const announcement = await this.prisma.announcement.create({
      data: { title, body, courseId, authorId: teacherId },
    });

    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId, status: { in: ['ACTIVE', 'COMPLETED'] } },
      select: { studentId: true },
    });
    await Promise.all(
      enrollments.map((e) =>
        this.notifications.create(e.studentId, `Annonce — ${course.title}`, title, 'ANNOUNCEMENT'),
      ),
    );

    return announcement;
  }

  /** Enseignant — ses propres annonces, tous cours confondus */
  myAnnouncements(teacherId: string) {
    return this.prisma.announcement.findMany({
      where: { authorId: teacherId },
      include: { course: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Étudiant — annonces des cours auxquels il est inscrit */
  async forStudent(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      select: { courseId: true },
    });
    const courseIds = enrollments.map((e) => e.courseId);
    if (courseIds.length === 0) return [];

    return this.prisma.announcement.findMany({
      where: { courseId: { in: courseIds } },
      include: { course: { select: { title: true } }, author: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }
}
