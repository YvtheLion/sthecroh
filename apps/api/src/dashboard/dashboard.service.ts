import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public — alimente le bandeau de statistiques de la page d'accueil */
  async publicStats() {
    const [studentsCount, coursesCount, certificatesCount, enrollmentStats] = await Promise.all([
      this.prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
      this.prisma.course.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.certificate.count(),
      this.prisma.enrollment.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    const total = enrollmentStats.reduce((sum, s) => sum + s._count._all, 0);
    const completed = enrollmentStats.find((s) => s.status === 'COMPLETED')?._count._all ?? 0;
    const successRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      studentsCount,
      coursesCount,
      certificatesCount,
      successRate,
    };
  }

  async studentSummary(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId, status: { in: ['ACTIVE', 'COMPLETED'] } },
      include: { course: { select: { id: true, title: true, teacher: { select: { firstName: true, lastName: true } } } } },
      orderBy: { enrolledAt: 'desc' },
    });

    const coursesInProgress = enrollments.filter((e) => e.status === 'ACTIVE').length;
    const averageProgress =
      enrollments.length === 0
        ? 0
        : Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length);

    const certificatesCount = await this.prisma.certificate.count({ where: { userId: studentId } });

    const courseIds = enrollments.map((e) => e.courseId);
    const now = new Date();

    const upcomingExams = courseIds.length
      ? await this.prisma.exam.findMany({
          where: {
            courseId: { in: courseIds },
            OR: [{ availableTo: null }, { availableTo: { gte: now } }],
          },
          include: { course: { select: { title: true } } },
          orderBy: { availableTo: 'asc' },
          take: 5,
        })
      : [];

    const attempts = await this.prisma.examAttempt.findMany({
      where: { studentId, examId: { in: upcomingExams.map((e) => e.id) } },
      select: { examId: true, submittedAt: true },
    });
    const submissions = await this.prisma.submission.findMany({
      where: { studentId, examId: { in: upcomingExams.map((e) => e.id) } },
      select: { examId: true },
    });
    const submittedExamIds = new Set([
      ...attempts.filter((a) => a.submittedAt).map((a) => a.examId),
      ...submissions.map((s) => s.examId),
    ]);

    const deadlines = upcomingExams.map((exam) => {
      const done = submittedExamIds.has(exam.id);
      let tag = 'À venir';
      if (done) {
        tag = 'Terminé';
      } else if (exam.availableTo) {
        const days = Math.max(0, Math.ceil((exam.availableTo.getTime() - now.getTime()) / 86_400_000));
        tag = `${days} jour${days > 1 ? 's' : ''}`;
      }
      return {
        examId: exam.id,
        type: exam.type,
        label: `${exam.course.title} — ${exam.title}`,
        tag,
        done,
      };
    });

    const assignmentsDue = deadlines.filter((d) => !d.done).length;

    return {
      kpis: {
        coursesInProgress,
        averageProgress,
        assignmentsDue,
        certificatesCount,
      },
      courses: enrollments.map((e) => ({
        id: e.course.id,
        title: e.course.title,
        teacher: `${e.course.teacher.firstName} ${e.course.teacher.lastName}`,
        progress: e.progress,
        status: e.status,
      })),
      deadlines,
    };
  }

  async teacherSummary(teacherId: string) {
    const courses = await this.prisma.course.findMany({
      where: { teacherId },
      include: { enrollments: true, exams: true },
      orderBy: { createdAt: 'desc' },
    });

    const courseIds = courses.map((c) => c.id);
    const studentIds = new Set(courses.flatMap((c) => c.enrollments.map((e) => e.studentId)));

    const pendingSubmissions = courseIds.length
      ? await this.prisma.submission.findMany({
          where: { exam: { courseId: { in: courseIds } }, score: null },
          include: {
            student: { select: { firstName: true, lastName: true } },
            exam: { select: { title: true, courseId: true } },
          },
          orderBy: { submittedAt: 'asc' },
          take: 10,
        })
      : [];

    const gradedCount = courseIds.length
      ? await this.prisma.submission.count({
          where: { exam: { courseId: { in: courseIds } }, score: { not: null } },
        })
      : 0;
    const totalSubmissions = gradedCount + pendingSubmissions.length;
    const successRate = totalSubmissions === 0 ? 0 : Math.round((gradedCount / totalSubmissions) * 100);

    const liveLessons = courseIds.length
      ? await this.prisma.lesson.findMany({
          where: { type: 'LIVE_SESSION', module: { courseId: { in: courseIds } } },
          include: { module: { include: { course: { select: { title: true } } } } },
          orderBy: { liveStartsAt: 'asc' },
        })
      : [];

    return {
      kpis: {
        activeCourses: courses.length,
        studentsCount: studentIds.size,
        pendingGrading: pendingSubmissions.length,
        successRate,
      },
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        studentsCount: c.enrollments.length,
        examsCount: c.exams.length,
      })),
      liveSessions: liveLessons.map((l) => ({
        id: l.id,
        title: l.title,
        courseTitle: l.module.course.title,
        liveUrl: l.liveUrl,
        liveStartsAt: l.liveStartsAt,
      })),
      pendingSubmissions: pendingSubmissions.map((s) => ({
        id: s.id,
        studentName: `${s.student.firstName} ${s.student.lastName}`,
        examTitle: s.exam.title,
        courseId: s.exam.courseId,
        submittedAt: s.submittedAt,
      })),
    };
  }
}
