import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GradesService {
  constructor(private readonly prisma: PrismaService) {}

  publishGrade(params: { studentId: string; teacherId: string; examId: string; score: number; maxScore?: number; comment?: string }) {
    return this.prisma.grade.upsert({
      where: { studentId_examId: { studentId: params.studentId, examId: params.examId } },
      update: { score: params.score, comment: params.comment },
      create: {
        studentId: params.studentId,
        teacherId: params.teacherId,
        examId: params.examId,
        score: params.score,
        maxScore: params.maxScore ?? 100,
        comment: params.comment,
      },
    });
  }

  forStudent(studentId: string) {
    return this.prisma.grade.findMany({
      where: { studentId },
      include: { exam: { include: { course: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  forCourse(courseId: string) {
    return this.prisma.grade.findMany({
      where: { exam: { courseId } },
      include: { student: { select: { firstName: true, lastName: true } } },
    });
  }
}
