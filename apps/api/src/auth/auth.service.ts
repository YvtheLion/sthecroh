import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { authenticator } from 'otplib';
import { PrismaService } from '../prisma/prisma.service';
import { EmailsService } from '../emails/emails.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly emails: EmailsService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cet e-mail.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const emailVerificationToken = crypto.randomBytes(24).toString('hex');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role ?? 'STUDENT',
        status: 'PENDING', // activé après vérification e-mail
        emailVerificationToken,
      },
    });

    const verifyUrl = `${process.env.WEB_URL}/verifier-email/${emailVerificationToken}`;
    await this.emails.sendVerificationEmail(user.email, user.firstName, verifyUrl);

    return this.sanitize(user);
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({ where: { emailVerificationToken: token } });
    if (!user) throw new NotFoundException('Lien de vérification invalide ou déjà utilisé.');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        status: user.status === 'PENDING' ? 'ACTIVE' : user.status,
      },
    });

    return { verified: true };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Identifiants invalides.');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides.');

    if (user.status === 'SUSPENDED' || user.status === 'ARCHIVED') {
      throw new UnauthorizedException('Ce compte est désactivé.');
    }

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);

    if (user.twoFactorEnabled) {
      if (!dto.twoFactorCode) {
        return { requiresTwoFactor: true };
      }
      const valid = authenticator.check(dto.twoFactorCode, user.twoFactorSecret ?? '');
      if (!valid) throw new UnauthorizedException('Code de double authentification invalide.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.prisma.activityLog.create({
      data: { userId: user.id, action: 'LOGIN' },
    });

    return this.issueTokens(user.id, user.role);
  }

  async issueTokens(userId: string, role: string) {
    const payload = { sub: userId, role };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: '15m' });
    const refreshToken = await this.jwt.signAsync(payload, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  }

  async enableTwoFactor(userId: string) {
    const secret = authenticator.generateSecret();
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret, twoFactorEnabled: true },
    });
    return { secret, otpauthUrl: authenticator.keyuri(userId, 'STHECROH', secret) };
  }

  private sanitize(user: { passwordHash?: string; [k: string]: unknown }) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
