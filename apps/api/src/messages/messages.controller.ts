import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('contacts')
  contacts(@Req() req: { user: { userId: string; role: string } }) {
    return this.messagesService.contacts(req.user.userId, req.user.role);
  }

  @Get('conversations')
  conversations(@Req() req: { user: { userId: string } }) {
    return this.messagesService.conversations(req.user.userId);
  }

  @Get('thread/:partnerId')
  thread(@Req() req: { user: { userId: string } }, @Param('partnerId') partnerId: string) {
    return this.messagesService.thread(req.user.userId, partnerId);
  }

  @Post()
  send(
    @Req() req: { user: { userId: string; role: string } },
    @Body() body: { recipientId: string; body: string },
  ) {
    return this.messagesService.send(req.user.userId, req.user.role, body.recipientId, body.body);
  }
}
