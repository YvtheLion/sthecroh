import { Module } from '@nestjs/common';
import { LibraryResourcesService } from './library.service';
import { LibraryResourcesController } from './library.controller';

@Module({
  controllers: [LibraryResourcesController],
  providers: [LibraryResourcesService],
  exports: [LibraryResourcesService],
})
export class LibraryResourcesModule {}
