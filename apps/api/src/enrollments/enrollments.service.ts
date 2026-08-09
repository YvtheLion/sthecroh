import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async enroll(studentId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Cours introuvable.');

    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });

    if (existing) {
      // Auto-réparation : tant que le paiement n'est pas relié à l'activation d'inscription,
      // on réactive toute inscription existante bloquée plutôt que de laisser l'étudiant coincé.
      if (existing.status !== 'ACTIVE' && existing.status !== 'COMPLETED') {
        return this.prisma.enrollment.update({ where: { id: existing.id }, data: { status: 'ACTIVE' } });
      }
      throw new BadRequestException(`Vous êtes déjà inscrit à ce cours (statut actuel : ${existing.status}).`);
    }

    // Les cours gratuits (priceCents = 0) sont activés immédiatement ; les cours payants
    // passent par le module Paiements avant activation (à brancher lors de l'étape paiements réels).
    const enrollment = await this.prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        status: course.priceCents === 0 ? 'ACTIVE' : 'PENDING_PAYMENT',
      },
    });

    await this.prisma.activityLog.create({
      data: { userId: studentId, action: 'ENROLLMENT_CREATED', metadata: { courseId, courseTitle: course.title } },
    });

    return enrollment;
  }

  forStudent(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: { course: true },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async updateProgress(studentId: string, courseId: string, progress: number) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (!enrollment) throw new NotFoundException('Inscription introuvable.');

    const clamped = Math.max(0, Math.min(100, progress));
    return this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: clamped,
        status: clamped >= 100 ? 'COMPLETED' : 'ACTIVE',
        completedAt: clamped >= 100 ? new Date() : null,
      },
    });
  }
}
