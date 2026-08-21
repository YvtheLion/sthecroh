import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly service: SiteSettingsService) {}

  /** Public — le logo doit s'afficher pour tout visiteur, sans connexion */
  @Get()
  get() {
    return this.service.get();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch()
  update(
    @Body()
    body: {
      logoUrl?: string | null;
      faviconUrl?: string | null;
      heroTitle?: string | null;
      heroSubtitle?: string | null;
      socialLinks?: { platform: string; url: string }[] | null;
    },
  ) {
    return this.service.update(body);
  }
}
