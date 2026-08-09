import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /** Public — statistiques réelles affichées sur la page d'accueil */
  @Get('stats')
  publicStats() {
    return this.dashboardService.publicStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('student')
  studentSummary(@Req() req: { user: { userId: string } }) {
    return this.dashboardService.studentSummary(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('teacher')
  teacherSummary(@Req() req: { user: { userId: string } }) {
    return this.dashboardService.teacherSummary(req.user.userId);
  }
}
