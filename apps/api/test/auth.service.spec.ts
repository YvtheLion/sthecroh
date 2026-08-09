import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { EmailsService } from '../src/emails/emails.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    activityLog: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      activityLog: { create: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('fake.jwt.token') },
        },
        {
          provide: EmailsService,
          useValue: { sendVerificationEmail: jest.fn().mockResolvedValue({ sent: false }) },
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it("refuse l'inscription si l'e-mail existe déjà", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        authService.register({
          email: 'deja@sthecroh.edu',
          password: 'motdepasse123',
          firstName: 'Jean',
          lastName: 'Dupont',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('crée un compte avec le mot de passe haché (jamais en clair)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'new-user', ...data }),
      );

      const result = await authService.register({
        email: 'nouveau@sthecroh.edu',
        password: 'motdepasse123',
        firstName: 'Jean',
        lastName: 'Dupont',
      });

      const createCallArgs = prisma.user.create.mock.calls[0][0].data;
      expect(createCallArgs.passwordHash).not.toBe('motdepasse123');
      expect(await bcrypt.compare('motdepasse123', createCallArgs.passwordHash)).toBe(true);
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    it('refuse la connexion avec un mauvais mot de passe', async () => {
      const passwordHash = await bcrypt.hash('bonMotDePasse', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        passwordHash,
        status: 'ACTIVE',
        role: 'STUDENT',
        twoFactorEnabled: false,
      });

      await expect(
        authService.login({ email: 'test@sthecroh.edu', password: 'mauvaisMotDePasse' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('refuse la connexion pour un compte suspendu', async () => {
      const passwordHash = await bcrypt.hash('bonMotDePasse', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        passwordHash,
        status: 'SUSPENDED',
        role: 'STUDENT',
      });

      await expect(
        authService.login({ email: 'test@sthecroh.edu', password: 'bonMotDePasse' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('délivre un token pour des identifiants valides', async () => {
      const passwordHash = await bcrypt.hash('bonMotDePasse', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        passwordHash,
        status: 'ACTIVE',
        role: 'STUDENT',
        twoFactorEnabled: false,
      });
      prisma.user.update.mockResolvedValue({});

      const result = await authService.login({ email: 'test@sthecroh.edu', password: 'bonMotDePasse' });

      expect(result).toHaveProperty('accessToken', 'fake.jwt.token');
      expect(result).toHaveProperty('refreshToken', 'fake.jwt.token');
    });

    it('demande le code 2FA si activée, sans le révéler par avance', async () => {
      const passwordHash = await bcrypt.hash('bonMotDePasse', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        passwordHash,
        status: 'ACTIVE',
        role: 'STUDENT',
        twoFactorEnabled: true,
        twoFactorSecret: 'SECRET',
      });

      const result = await authService.login({ email: 'test@sthecroh.edu', password: 'bonMotDePasse' });

      expect(result).toEqual({ requiresTwoFactor: true });
    });
  });
});
