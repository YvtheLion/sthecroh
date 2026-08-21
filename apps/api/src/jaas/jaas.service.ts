import { Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

export interface JoinTarget {
  provider: 'jaas' | 'jitsi';
  /** URL complète et prête à être ouverte dans un iframe */
  joinUrl: string;
}

@Injectable()
export class JaasService {
  private readonly logger = new Logger('JaasService');
  private readonly appId = process.env.JAAS_APP_ID;
  private readonly apiKeyId = process.env.JAAS_API_KEY_ID;
  // La clé privée est stockée encodée en base64 dans la variable d'environnement (évite les
  // problèmes de retours à la ligne dans un fichier .env classique).
  private readonly privateKey = process.env.JAAS_PRIVATE_KEY_BASE64
    ? Buffer.from(process.env.JAAS_PRIVATE_KEY_BASE64, 'base64').toString('utf8')
    : undefined;

  get isConfigured() {
    return !!(this.appId && this.apiKeyId && this.privateKey);
  }

  /** Génère un identifiant de salle stable, à réutiliser pour tous les participants d'une même leçon */
  generateRoomName(): string {
    return `sthecroh-${crypto.randomBytes(6).toString('hex')}`;
  }

  /**
   * Construit l'URL de connexion pour UN utilisateur précis, avec un jeton signé qui encode son
   * rôle (modérateur ou non), son nom et son e-mail. Chaque appel génère un nouveau jeton — la
   * connexion se fait donc toujours avec des droits vérifiés côté serveur, jamais falsifiables
   * côté navigateur.
   */
  buildJoinTarget(params: {
    roomName: string;
    userId: string;
    displayName: string;
    email: string;
    isModerator: boolean;
  }): JoinTarget {
    if (!this.isConfigured) {
      this.logger.warn(
        'JaaS non configuré (JAAS_APP_ID / JAAS_API_KEY_ID / JAAS_PRIVATE_KEY_BASE64 manquants) — ' +
          'repli sur Jitsi Meet public (moins fiable, apparence non personnalisée).',
      );
      return { provider: 'jitsi', joinUrl: `https://meet.jit.si/${params.roomName}` };
    }

    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
      {
        aud: 'jitsi',
        iss: 'chat',
        sub: this.appId,
        room: params.roomName,
        context: {
          user: {
            id: params.userId,
            name: params.displayName,
            email: params.email,
            moderator: params.isModerator,
          },
          features: {
            recording: true,
            livestreaming: false,
            transcription: false,
            'outbound-call': false,
          },
        },
        nbf: now - 10,
        exp: now + 60 * 60 * 3, // le jeton reste valide 3h, largement suffisant pour une session
      },
      this.privateKey!,
      { algorithm: 'RS256', header: { kid: this.apiKeyId!, typ: 'JWT', alg: 'RS256' } },
    );

    return {
      provider: 'jaas',
      joinUrl: `https://8x8.vc/${this.appId}/${params.roomName}?jwt=${token}`,
    };
  }
}
