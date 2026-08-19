import { Injectable, Logger } from '@nestjs/common';

interface DailyRoomResult {
  provider: 'daily' | 'jitsi';
  url: string;
}

@Injectable()
export class DailyService {
  private readonly logger = new Logger('DailyService');
  private readonly apiKey = process.env.DAILY_API_KEY;

  /**
   * Crée une vraie salle sur l'infrastructure vidéo dédiée de Daily.co (pas de bande passante
   * partagée avec des inconnus, pas de watermark ni de marque tierce visible, connexions stables).
   *
   * Si `DAILY_API_KEY` n'est pas configurée, on retombe proprement sur Jitsi Meet public — la
   * plateforme reste fonctionnelle en attendant que la clé soit renseignée, sans jamais planter.
   */
  async createRoom(roomName: string, expiresAt?: Date): Promise<DailyRoomResult> {
    if (!this.apiKey) {
      this.logger.warn(
        "DAILY_API_KEY absente — repli sur Jitsi Meet public (moins fiable). " +
          'Créez un compte gratuit sur daily.co et renseignez la clé pour une visio professionnelle.',
      );
      return { provider: 'jitsi', url: `https://meet.jit.si/${roomName}` };
    }

    // La salle expire automatiquement 4h après l'heure prévue (ou dans 30 jours si pas de date),
    // pour ne pas accumuler de salles inutilisées sur le compte.
    const exp = expiresAt
      ? Math.floor(expiresAt.getTime() / 1000) + 4 * 60 * 60
      : Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

    try {
      const res = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomName,
          privacy: 'public',
          properties: {
            exp,
            enable_chat: true,
            enable_screenshare: true,
            enable_recording: 'cloud',
            eject_at_room_exp: true,
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        this.logger.error(`Échec de création de salle Daily.co (${res.status}) : ${body}`);
        return { provider: 'jitsi', url: `https://meet.jit.si/${roomName}` };
      }

      const data = (await res.json()) as { url: string };
      return { provider: 'daily', url: data.url };
    } catch (err) {
      this.logger.error(`Erreur réseau vers Daily.co : ${(err as Error).message}`);
      return { provider: 'jitsi', url: `https://meet.jit.si/${roomName}` };
    }
  }
}
