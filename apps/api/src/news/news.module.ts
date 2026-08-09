import { Module } from '@nestjs/common';
import { NewsPostsService } from './news.service';
import { NewsPostsController } from './news.controller';

@Module({
  controllers: [NewsPostsController],
  providers: [NewsPostsService],
})
export class NewsPostsModule {}
