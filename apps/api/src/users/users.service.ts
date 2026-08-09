import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(role?: string) {
    return this.prisma.user.findMany({
      where: role ? { role: role as any } : undefined,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, status: true, createdAt: true, avatarUrl: true, title: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Public — utilisé par la section "Corps professoral" de la page d'accueil */
  findPublishedTeachers() {
    return this.prisma.user.findMany({
      where: { role: 'TEACHER', status: 'ACTIVE' },
      select: { id: true, firstName: true, lastName: true, title: true, avatarUrl: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        role: true, status: true, avatarUrl: true, twoFactorEnabled: true,
        createdAt: true, departmentId: true,
      },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return user;
  }

  updateProfile(id: string, data: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  setStatus(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED' | 'PENDING') {
    return this.prisma.user.update({ where: { id }, data: { status } });
  }

  setRole(id: string, role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN') {
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  /** Admin — édition complète d'un profil utilisateur (ex: intitulé de poste d'un enseignant) */
  adminUpdate(
    id: string,
    data: { firstName?: string; lastName?: string; phone?: string; title?: string; avatarUrl?: string; departmentId?: string },
  ) {
    return this.prisma.user.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
