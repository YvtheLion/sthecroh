import { Module } from '@nestjs/common';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { CertificatesModule } from '../certificates/certificates.module';

@Module({
  imports: [NotificationsModule, CertificatesModule],
  controllers: [LearningController],
  providers: [LearningService],
})
export class LearningModule {}
