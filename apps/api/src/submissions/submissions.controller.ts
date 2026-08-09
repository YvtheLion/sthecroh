import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  /** Étudiant — remettre un devoir */
  @Post()
  submit(
    @Req() req: { user: { userId: string } },
    @Body() body: { examId: string; fileUrl?: string; comment?: string },
  ) {
    return this.submissionsService.submit(req.user.userId, body.examId, body);
  }

  /** Étudiant — mes devoirs remis */
  @Get('mine')
  mine(@Req() req: { user: { userId: string } }) {
    return this.submissionsService.mine(req.user.userId);
  }

  /** Enseignant — copies à corriger */
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  @Get('pending')
  pending(@Req() req: { user: { userId: string } }) {
    return this.submissionsService.pendingForTeacher(req.user.userId);
  }

  /** Enseignant — noter une copie */
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  @Patch(':id/grade')
  grade(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() body: { score: number; feedback?: string },
  ) {
    return this.submissionsService.grade(req.user.userId, id, body.score, body.feedback);
  }
}
