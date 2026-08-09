import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { TeacherCoursesService } from './teacher-courses.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
@Controller('teacher')
export class TeacherCoursesController {
  constructor(private readonly service: TeacherCoursesService) {}

  @Get('courses')
  myCourses(@Req() req: { user: { userId: string } }) {
    return this.service.myCourses(req.user.userId);
  }

  @Post('courses')
  createCourse(
    @Req() req: { user: { userId: string } },
    @Body() body: { title: string; slug: string; description?: string; credits?: number; priceCents?: number },
  ) {
    return this.service.createCourse(req.user.userId, body);
  }

  @Get('courses/:id')
  getCourseDetail(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.service.getCourseDetail(req.user.userId, id);
  }

  @Patch('courses/:id')
  updateCourse(@Req() req: { user: { userId: string } }, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.updateCourse(req.user.userId, id, body);
  }

  @Delete('courses/:id')
  deleteCourse(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.service.deleteCourse(req.user.userId, id);
  }

  @Post('courses/:id/modules')
  addModule(@Req() req: { user: { userId: string } }, @Param('id') id: string, @Body('title') title: string) {
    return this.service.addModule(req.user.userId, id, title);
  }

  @Patch('modules/:id')
  updateModule(@Req() req: { user: { userId: string } }, @Param('id') id: string, @Body('title') title: string) {
    return this.service.updateModule(req.user.userId, id, title);
  }

  @Delete('modules/:id')
  deleteModule(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.service.deleteModule(req.user.userId, id);
  }

  @Post('modules/:id/lessons')
  addLesson(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() body: { title: string; type: string; videoUrl?: string; pdfUrl?: string; content?: string; durationMin?: number; liveStartsAt?: string },
  ) {
    return this.service.addLesson(req.user.userId, id, body);
  }

  @Patch('lessons/:id')
  updateLesson(@Req() req: { user: { userId: string } }, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.updateLesson(req.user.userId, id, body);
  }

  @Delete('lessons/:id')
  deleteLesson(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.service.deleteLesson(req.user.userId, id);
  }

  @Post('courses/:id/exams')
  createExam(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body()
    body: {
      title: string;
      type: string;
      maxScore?: number;
      durationMin?: number;
      availableTo?: string;
      instructions?: string;
      questions?: { type: string; prompt: string; points: number; options?: unknown }[];
    },
  ) {
    return this.service.createExam(req.user.userId, id, body);
  }

  @Delete('exams/:id')
  deleteExam(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.service.deleteExam(req.user.userId, id);
  }

  @Post('exams/:id/questions')
  addQuestion(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() body: { type: string; prompt: string; points: number; options?: unknown },
  ) {
    return this.service.addQuestion(req.user.userId, id, body);
  }

  @Delete('questions/:id')
  deleteQuestion(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.service.deleteQuestion(req.user.userId, id);
  }
}
