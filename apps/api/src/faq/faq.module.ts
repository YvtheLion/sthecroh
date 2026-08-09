import { Module } from '@nestjs/common';
import { FaqItemsService } from './faq.service';
import { FaqItemsController } from './faq.controller';

@Module({
  controllers: [FaqItemsController],
  providers: [FaqItemsService],
})
export class FaqItemsModule {}
