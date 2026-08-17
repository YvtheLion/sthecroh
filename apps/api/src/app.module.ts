import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DepartmentsModule } from './departments/departments.module';
import { ProgramsModule } from './programs/programs.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ExamsModule } from './exams/exams.module';
import { GradesModule } from './grades/grades.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { LearningModule } from './learning/learning.module';
import { MessagesModule } from './messages/messages.module';
import { TeacherCoursesModule } from './teacher-courses/teacher-courses.module';
import { UploadsModule } from './uploads/uploads.module';
import { EmailsModule } from './emails/emails.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { SemestersModule } from './semesters/semesters.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { HealthModule } from './health/health.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { PaypalModule } from './paypal/paypal.module';
import { PaymentsModule } from './payments/payments.module';
import { DonationsModule } from './donations/donations.module';
import { CertificatesModule } from './certificates/certificates.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LibraryResourcesModule } from './library/library.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { EventsModule } from './events/events.module';
import { GalleryImagesModule } from './gallery/gallery.module';
import { FaqItemsModule } from './faq/faq.module';
import { NewsPostsModule } from './news/news.module';
import { HistoryMilestonesModule } from './history/history.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    DepartmentsModule,
    ProgramsModule,
    CoursesModule,
    EnrollmentsModule,
    ExamsModule,
    GradesModule,
    SubmissionsModule,
    LearningModule,
    MessagesModule,
    TeacherCoursesModule,
    UploadsModule,
    EmailsModule,
    AcademicYearsModule,
    SemestersModule,
    AnnouncementsModule,
    ActivityLogsModule,
    HealthModule,
    SiteSettingsModule,
    PaypalModule,
    PaymentsModule,
    DonationsModule,
    CertificatesModule,
    NotificationsModule,
    LibraryResourcesModule,
    DashboardModule,
    TestimonialsModule,
    EventsModule,
    GalleryImagesModule,
    FaqItemsModule,
    NewsPostsModule,
    HistoryMilestonesModule,
    ContactMessagesModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
