import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Ce test ne vérifie AUCUNE logique métier — il vérifie uniquement que NestJS parvient à
 * assembler l'ensemble des modules de l'application (imports, providers, contrôleurs).
 *
 * C'est exactement le type de test qui aurait immédiatement révélé les bugs rencontrés en
 * développement (ex: `LibraryModule` importé alors que la classe exportée était en réalité
 * `LibraryResourcesModule`) — sans avoir besoin de lancer le serveur ni la base de données.
 *
 * On remplace PrismaService par un faux objet minimal : ce test ne se connecte donc jamais
 * à une vraie base PostgreSQL et peut tourner n'importe où, y compris en CI.
 */
describe('AppModule (assemblage complet)', () => {
  it('compile sans erreur avec tous les modules métier', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .compile();

    expect(moduleRef).toBeDefined();
    await moduleRef.close();
  });
});
