import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { LearningService } from './learning.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Get('courses/:courseId')
  getCourse(@Req() req: { user: { userId: string } }, @Param('courseId') courseId: string) {
    return this.learningService.getCourseForStudent(req.user.userId, courseId);
  }

  @Patch('lessons/:lessonId/complete')
  completeLesson(@Req() req: { user: { userId: string } }, @Param('lessonId') lessonId: string) {
    return this.learningService.completeLesson(req.user.userId, lessonId);
  }

  @Get('exams/:examId')
  getExam(@Req() req: { user: { userId: string } }, @Param('examId') examId: string) {
    return this.learningService.getExamForStudent(req.user.userId, examId);
  }

  @Post('exams/:examId/submit')
  submitExam(
    @Req() req: { user: { userId: string } },
    @Param('examId') examId: string,
    @Body() body: { answers: Record<string, string> },
  ) {
    return this.learningService.submitExamAttempt(req.user.userId, examId, body.answers ?? {});
  }

  /** Génère un lien de connexion signé, propre à l'utilisateur, pour une session en direct */
  @Get('live/:lessonId')
  getLiveJoinUrl(@Req() req: { user: { userId: string } }, @Param('lessonId') lessonId: string) {
    return this.learningService.getLiveJoinUrl(req.user.userId, lessonId);
  }
}
