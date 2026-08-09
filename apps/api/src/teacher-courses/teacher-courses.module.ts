import { Module } from '@nestjs/common';
import { TeacherCoursesService } from './teacher-courses.service';
import { TeacherCoursesController } from './teacher-courses.controller';

@Module({
  controllers: [TeacherCoursesController],
  providers: [TeacherCoursesService],
})
export class TeacherCoursesModule {}
