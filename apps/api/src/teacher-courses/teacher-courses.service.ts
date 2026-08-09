import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeacherCoursesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOwnsCourse(teacherId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Cours introuvable.');
    if (course.teacherId !== teacherId) throw new ForbiddenException("Ce cours ne vous appartient pas.");
    return course;
  }

  private async assertOwnsModule(teacherId: string, moduleId: string) {
    const module_ = await this.prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
    if (!module_) throw new NotFoundException('Module introuvable.');
    if (module_.course.teacherId !== teacherId) throw new ForbiddenException("Ce module ne vous appartient pas.");
    return module_;
  }

  private async assertOwnsExam(teacherId: string, examId: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId }, include: { course: true } });
    if (!exam) throw new NotFoundException('Examen introuvable.');
    if (exam.course.teacherId !== teacherId) throw new ForbiddenException("Cet examen ne vous appartient pas.");
    return exam;
  }

  // ---------- Cours ----------

  myCourses(teacherId: string) {
    return this.prisma.course.findMany({
      where: { teacherId },
      include: { _count: { select: { enrollments: true, modules: true, exams: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  createCourse(teacherId: string, data: { title: string; slug: string; description?: string; credits?: number; priceCents?: number }) {
    return this.prisma.course.create({
      data: { ...data, teacherId, status: 'DRAFT' },
    });
  }

  async updateCourse(teacherId: string, courseId: string, data: Partial<{ title: string; description: string; status: string; credits: number; priceCents: number }>) {
    await this.assertOwnsCourse(teacherId, courseId);
    return this.prisma.course.update({ where: { id: courseId }, data: data as any });
  }

  async deleteCourse(teacherId: string, courseId: string) {
    await this.assertOwnsCourse(teacherId, courseId);
    return this.prisma.course.delete({ where: { id: courseId } });
  }

  async getCourseDetail(teacherId: string, courseId: string) {
    await this.assertOwnsCourse(teacherId, courseId);
    return this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: { orderBy: { position: 'asc' }, include: { lessons: { orderBy: { position: 'asc' } } } },
        exams: { include: { questions: { orderBy: { position: 'asc' } } } },
      },
    });
  }

  // ---------- Modules ----------

  async addModule(teacherId: string, courseId: string, title: string) {
    await this.assertOwnsCourse(teacherId, courseId);
    const count = await this.prisma.module.count({ where: { courseId } });
    return this.prisma.module.create({ data: { courseId, title, position: count } });
  }

  async updateModule(teacherId: string, moduleId: string, title: string) {
    await this.assertOwnsModule(teacherId, moduleId);
    return this.prisma.module.update({ where: { id: moduleId }, data: { title } });
  }

  async deleteModule(teacherId: string, moduleId: string) {
    await this.assertOwnsModule(teacherId, moduleId);
    return this.prisma.module.delete({ where: { id: moduleId } });
  }

  // ---------- Leçons ----------

  async addLesson(
    teacherId: string,
    moduleId: string,
    data: { title: string; type: string; videoUrl?: string; pdfUrl?: string; content?: string; durationMin?: number; liveStartsAt?: string },
  ) {
    await this.assertOwnsModule(teacherId, moduleId);
    const count = await this.prisma.lesson.count({ where: { moduleId } });

    const isLive = data.type === 'LIVE_SESSION';
    const roomSlug = isLive ? `STHECROH-${crypto.randomBytes(6).toString('hex')}` : undefined;

    return this.prisma.lesson.create({
      data: {
        moduleId,
        position: count,
        title: data.title,
        type: data.type as any,
        videoUrl: data.videoUrl,
        pdfUrl: data.pdfUrl,
        content: data.content,
        durationMin: data.durationMin,
        ...(isLive
          ? {
              liveProvider: 'jitsi',
              liveUrl: `https://meet.jit.si/${roomSlug}`,
              liveStartsAt: data.liveStartsAt ? new Date(data.liveStartsAt) : undefined,
            }
          : {}),
      },
    });
  }

  async updateLesson(teacherId: string, lessonId: string, data: Record<string, unknown>) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId }, include: { module: { include: { course: true } } } });
    if (!lesson) throw new NotFoundException('Leçon introuvable.');
    if (lesson.module.course.teacherId !== teacherId) throw new ForbiddenException("Cette leçon ne vous appartient pas.");
    return this.prisma.lesson.update({ where: { id: lessonId }, data: data as any });
  }

  async deleteLesson(teacherId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId }, include: { module: { include: { course: true } } } });
    if (!lesson) throw new NotFoundException('Leçon introuvable.');
    if (lesson.module.course.teacherId !== teacherId) throw new ForbiddenException("Cette leçon ne vous appartient pas.");
    return this.prisma.lesson.delete({ where: { id: lessonId } });
  }

  // ---------- Examens & questions ----------

  async createExam(
    teacherId: string,
    courseId: string,
    data: {
      title: string;
      type: string;
      maxScore?: number;
      durationMin?: number;
      availableTo?: string;
      instructions?: string;
      questions?: { type: string; prompt: string; points: number; options?: unknown }[];
    },
  ) {
    await this.assertOwnsCourse(teacherId, courseId);
    return this.prisma.exam.create({
      data: {
        courseId,
        title: data.title,
        type: data.type as any,
        maxScore: data.maxScore ?? 100,
        durationMin: data.durationMin,
        availableTo: data.availableTo ? new Date(data.availableTo) : undefined,
        instructions: data.instructions,
        questions: data.questions
          ? {
              create: data.questions.map((q, i) => ({
                type: q.type as any,
                prompt: q.prompt,
                points: q.points,
                options: q.options as any,
                position: i,
              })),
            }
          : undefined,
      },
      include: { questions: true },
    });
  }

  async deleteExam(teacherId: string, examId: string) {
    await this.assertOwnsExam(teacherId, examId);
    return this.prisma.exam.delete({ where: { id: examId } });
  }

  async addQuestion(teacherId: string, examId: string, data: { type: string; prompt: string; points: number; options?: unknown }) {
    await this.assertOwnsExam(teacherId, examId);
    const count = await this.prisma.question.count({ where: { examId } });
    return this.prisma.question.create({
      data: { examId, type: data.type as any, prompt: data.prompt, points: data.points, options: data.options as any, position: count },
    });
  }

  async deleteQuestion(teacherId: string, questionId: string) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId }, include: { exam: { include: { course: true } } } });
    if (!question) throw new NotFoundException('Question introuvable.');
    if (question.exam.course.teacherId !== teacherId) throw new ForbiddenException("Cette question ne vous appartient pas.");
    return this.prisma.question.delete({ where: { id: questionId } });
  }
}
