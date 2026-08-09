import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EnrollmentsService } from '../src/enrollments/enrollments.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let prisma: {
    course: { findUnique: jest.Mock };
    enrollment: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      course: { findUnique: jest.fn() },
      enrollment: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [EnrollmentsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(EnrollmentsService);
  });

  it('lève une erreur si le cours n’existe pas', async () => {
    prisma.course.findUnique.mockResolvedValue(null);
    await expect(service.enroll('student-1', 'cours-inconnu')).rejects.toThrow(NotFoundException);
  });

  it('active immédiatement une inscription à un cours gratuit', async () => {
    prisma.course.findUnique.mockResolvedValue({ id: 'course-1', priceCents: 0 });
    prisma.enrollment.findUnique.mockResolvedValue(null);
    prisma.enrollment.create.mockResolvedValue({ id: 'enr-1', status: 'ACTIVE' });

    await service.enroll('student-1', 'course-1');

    expect(prisma.enrollment.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'ACTIVE' }) }),
    );
  });

  it('met un cours payant en attente de paiement', async () => {
    prisma.course.findUnique.mockResolvedValue({ id: 'course-2', priceCents: 4900 });
    prisma.enrollment.findUnique.mockResolvedValue(null);
    prisma.enrollment.create.mockResolvedValue({ id: 'enr-2', status: 'PENDING_PAYMENT' });

    await service.enroll('student-1', 'course-2');

    expect(prisma.enrollment.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'PENDING_PAYMENT' }) }),
    );
  });

  it('réactive automatiquement une inscription existante bloquée (régression corrigée)', async () => {
    prisma.course.findUnique.mockResolvedValue({ id: 'course-3', priceCents: 50 });
    prisma.enrollment.findUnique.mockResolvedValue({ id: 'enr-3', status: 'PENDING_PAYMENT' });
    prisma.enrollment.update.mockResolvedValue({ id: 'enr-3', status: 'ACTIVE' });

    const result = await service.enroll('student-1', 'course-3');

    expect(prisma.enrollment.update).toHaveBeenCalledWith({
      where: { id: 'enr-3' },
      data: { status: 'ACTIVE' },
    });
    expect(result.status).toBe('ACTIVE');
  });

  it('refuse une nouvelle inscription si déjà active', async () => {
    prisma.course.findUnique.mockResolvedValue({ id: 'course-4', priceCents: 0 });
    prisma.enrollment.findUnique.mockResolvedValue({ id: 'enr-4', status: 'ACTIVE' });

    await expect(service.enroll('student-1', 'course-4')).rejects.toThrow(BadRequestException);
  });
});
