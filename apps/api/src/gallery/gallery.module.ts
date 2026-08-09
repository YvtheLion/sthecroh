import { Module } from '@nestjs/common';
import { GalleryImagesService } from './gallery.service';
import { GalleryImagesController } from './gallery.controller';

@Module({
  controllers: [GalleryImagesController],
  providers: [GalleryImagesService],
})
export class GalleryImagesModule {}
