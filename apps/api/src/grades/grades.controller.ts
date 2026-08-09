import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { GradesService } from './grades.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  @Post()
  publish(
    @Req() req: { user: { userId: string } },
    @Body() body: { studentId: string; examId: string; score: number; maxScore?: number; comment?: string },
  ) {
    return this.gradesService.publishGrade({ ...body, teacherId: req.user.userId });
  }

  @Get('me')
  mine(@Req() req: { user: { userId: string } }) {
    return this.gradesService.forStudent(req.user.userId);
  }

  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  @Get('course/:courseId')
  forCourse(@Param('courseId') courseId: string) {
    return this.gradesService.forCourse(courseId);
  }
}
