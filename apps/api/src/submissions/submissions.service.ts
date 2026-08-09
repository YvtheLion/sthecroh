import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Étudiant : remet un devoir pour un examen de type ASSIGNMENT */
  async submit(studentId: string, examId: string, data: { fileUrl?: string; comment?: string }) {
    if (!data.fileUrl && !data.comment) {
      throw new BadRequestException('Ajoutez un lien de fichier ou un message avant de remettre le devoir.');
    }

    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Devoir introuvable.');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId: exam.courseId } },
    });
    if (!enrollment) throw new ForbiddenException("Vous n'êtes pas inscrit à ce cours.");

    const existing = await this.prisma.submission.findFirst({ where: { studentId, examId } });
    if (existing) {
      if (existing.score !== null) {
        throw new BadRequestException('Ce devoir a déjà été corrigé, il ne peut plus être modifié.');
      }
      return this.prisma.submission.update({
        where: { id: existing.id },
        data: { fileUrl: data.fileUrl, comment: data.comment, submittedAt: new Date() },
      });
    }

    return this.prisma.submission.create({
      data: { studentId, examId, fileUrl: data.fileUrl, comment: data.comment },
    });
  }

  mine(studentId: string) {
    return this.prisma.submission.findMany({
      where: { studentId },
      include: { exam: { select: { title: true, course: { select: { title: true } } } } },
      orderBy: { submittedAt: 'desc' },
    });
  }

  /** Copies non corrigées pour les cours d'un enseignant donné */
  async pendingForTeacher(teacherId: string) {
    return this.prisma.submission.findMany({
      where: { exam: { course: { teacherId } }, score: null },
      include: {
        student: { select: { firstName: true, lastName: true, email: true } },
        exam: { select: { title: true, maxScore: true, course: { select: { title: true } } } },
      },
      orderBy: { submittedAt: 'asc' },
    });
  }

  async grade(teacherId: string, submissionId: string, score: number, feedback?: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { exam: { include: { course: true } } },
    });
    if (!submission) throw new NotFoundException('Copie introuvable.');
    if (submission.exam.course.teacherId !== teacherId) {
      throw new ForbiddenException("Vous n'êtes pas l'enseignant de ce cours.");
    }

    const updated = await this.prisma.submission.update({
      where: { id: submissionId },
      data: { score, feedback, gradedAt: new Date() },
    });

    // Publie également la note dans le tableau Grade consulté par l'étudiant
    await this.prisma.grade.upsert({
      where: { studentId_examId: { studentId: submission.studentId, examId: submission.examId } },
      update: { score, comment: feedback },
      create: {
        studentId: submission.studentId,
        teacherId,
        examId: submission.examId,
        score,
        maxScore: submission.exam.maxScore,
        comment: feedback,
      },
    });

    await this.notifications.create(
      submission.studentId,
      'Note publiée',
      `Votre devoir "${submission.exam.title}" a été noté : ${score}/${submission.exam.maxScore}.`,
      'GRADE',
    );

    return updated;
  }
}
