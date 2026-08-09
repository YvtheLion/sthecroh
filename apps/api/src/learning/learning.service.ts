import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

interface McqOption {
  id: string;
  label: string;
  correct?: boolean;
}

@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Contenu complet d'un cours pour un étudiant inscrit : modules, leçons, progression par leçon */
  async getCourseForStudent(studentId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (!enrollment) throw new ForbiddenException("Vous n'êtes pas inscrit à ce cours.");

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: { select: { firstName: true, lastName: true } },
        modules: {
          orderBy: { position: 'asc' },
          include: { lessons: { orderBy: { position: 'asc' } } },
        },
      },
    });
    if (!course) throw new NotFoundException('Cours introuvable.');

    const progressRows = await this.prisma.lessonProgress.findMany({
      where: { studentId, lesson: { module: { courseId } } },
    });
    const completedLessonIds = new Set(progressRows.filter((p) => p.completed).map((p) => p.lessonId));

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      teacher: `${course.teacher.firstName} ${course.teacher.lastName}`,
      progress: enrollment.progress,
      modules: course.modules.map((m) => ({
        id: m.id,
        title: m.title,
        lessons: m.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          videoUrl: l.videoUrl,
          pdfUrl: l.pdfUrl,
          content: l.content,
          durationMin: l.durationMin,
          liveUrl: l.liveUrl,
          liveStartsAt: l.liveStartsAt,
          completed: completedLessonIds.has(l.id),
        })),
      })),
    };
  }

  /** Marque une leçon comme vue/terminée et recalcule la progression globale du cours */
  async completeLesson(studentId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson) throw new NotFoundException('Leçon introuvable.');

    const courseId = lesson.module.courseId;
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (!enrollment) throw new ForbiddenException("Vous n'êtes pas inscrit à ce cours.");

    await this.prisma.lessonProgress.upsert({
      where: { lessonId_studentId: { lessonId, studentId } },
      update: { completed: true },
      create: { lessonId, studentId, completed: true },
    });

    const totalLessons = await this.prisma.lesson.count({ where: { module: { courseId } } });
    const completedLessons = await this.prisma.lessonProgress.count({
      where: { studentId, completed: true, lesson: { module: { courseId } } },
    });
    const progress = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress,
        status: progress >= 100 ? 'COMPLETED' : 'ACTIVE',
        completedAt: progress >= 100 ? new Date() : null,
      },
    });

    return { progress };
  }

  /** Récupère un examen/quiz pour l'étudiant, SANS révéler les bonnes réponses */
  async getExamForStudent(studentId: string, examId: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: { orderBy: { position: 'asc' } }, course: true },
    });
    if (!exam) throw new NotFoundException('Examen introuvable.');
    if (exam.type === 'ASSIGNMENT') {
      throw new BadRequestException('Ce devoir se remet depuis le tableau de bord, pas ici.');
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId: exam.courseId } },
    });
    if (!enrollment) throw new ForbiddenException("Vous n'êtes pas inscrit à ce cours.");

    const existingAttempt = await this.prisma.examAttempt.findFirst({
      where: { studentId, examId },
      orderBy: { startedAt: 'desc' },
    });

    return {
      id: exam.id,
      title: exam.title,
      type: exam.type,
      courseTitle: exam.course.title,
      durationMin: exam.durationMin,
      maxScore: exam.maxScore,
      instructions: exam.instructions,
      alreadyAttempted: !!existingAttempt?.submittedAt,
      previousScore: existingAttempt?.submittedAt ? existingAttempt.score : null,
      questions: exam.questions.map((q) => ({
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        points: q.points,
        // Pour les QCM : on ne renvoie jamais le champ `correct` au client
        options: Array.isArray(q.options)
          ? (q.options as unknown as McqOption[]).map((o) => ({ id: o.id, label: o.label }))
          : null,
      })),
    };
  }

  /** Corrige automatiquement un examen (QCM/Vrai-Faux) et enregistre la tentative + la note */
  async submitExamAttempt(studentId: string, examId: string, answers: Record<string, string>) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true, course: true },
    });
    if (!exam) throw new NotFoundException('Examen introuvable.');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId: exam.courseId } },
    });
    if (!enrollment) throw new ForbiddenException("Vous n'êtes pas inscrit à ce cours.");

    const existing = await this.prisma.examAttempt.findFirst({
      where: { studentId, examId, submittedAt: { not: null } },
    });
    if (existing) {
      throw new BadRequestException('Vous avez déjà passé cet examen.');
    }

    let earnedPoints = 0;
    let totalAutoGradable = 0;
    let hasOpenQuestions = false;

    for (const q of exam.questions) {
      if (q.type === 'OPEN') {
        hasOpenQuestions = true;
        continue;
      }
      totalAutoGradable += q.points;
      const options = Array.isArray(q.options) ? (q.options as unknown as McqOption[]) : [];
      const correctOption = options.find((o) => o.correct);
      if (correctOption && answers[q.id] === correctOption.id) {
        earnedPoints += q.points;
      }
    }

    // Note finale seulement si l'examen ne contient aucune question ouverte à corriger manuellement
    const finalScore = hasOpenQuestions
      ? null
      : totalAutoGradable === 0
        ? 0
        : Math.round((earnedPoints / totalAutoGradable) * exam.maxScore);

    const attempt = await this.prisma.examAttempt.create({
      data: {
        studentId,
        examId,
        answers,
        score: finalScore,
        submittedAt: new Date(),
      },
    });

    if (finalScore !== null) {
      await this.prisma.grade.upsert({
        where: { studentId_examId: { studentId, examId } },
        update: { score: finalScore },
        create: {
          studentId,
        teacherId: exam.course.teacherId,
          examId,
          score: finalScore,
          maxScore: exam.maxScore,
        },
      });
      await this.notifications.create(
        studentId,
        'Résultat disponible',
        `Votre examen "${exam.title}" a été corrigé automatiquement : ${finalScore}/${exam.maxScore}.`,
        'GRADE',
      );
    }

    return { score: finalScore, maxScore: exam.maxScore, pendingManualGrading: hasOpenQuestions };
  }
}
