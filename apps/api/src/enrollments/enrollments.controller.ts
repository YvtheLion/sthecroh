import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  enroll(@Req() req: { user: { userId: string } }, @Body('courseId') courseId: string) {
    return this.enrollmentsService.enroll(req.user.userId, courseId);
  }

  @Get('me')
  mine(@Req() req: { user: { userId: string } }) {
    return this.enrollmentsService.forStudent(req.user.userId);
  }

  @Patch('progress')
  updateProgress(
    @Req() req: { user: { userId: string } },
    @Body() body: { courseId: string; progress: number },
  ) {
    return this.enrollmentsService.updateProgress(req.user.userId, body.courseId, body.progress);
  }
}
