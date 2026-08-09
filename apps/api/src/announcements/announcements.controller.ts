import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  @Post()
  create(
    @Req() req: { user: { userId: string } },
    @Body() body: { courseId: string; title: string; body: string },
  ) {
    return this.announcementsService.create(req.user.userId, body.courseId, body.title, body.body);
  }

  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN', 'SUPER_ADMIN')
  @Get('mine')
  mine(@Req() req: { user: { userId: string } }) {
    return this.announcementsService.myAnnouncements(req.user.userId);
  }

  @Get('for-me')
  forMe(@Req() req: { user: { userId: string } }) {
    return this.announcementsService.forStudent(req.user.userId);
  }
}
