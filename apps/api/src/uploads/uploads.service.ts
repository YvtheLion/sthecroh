import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string; resourceType: string }> {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new InternalServerErrorException(
        "Le stockage de fichiers n'est pas configuré (CLOUDINARY_CLOUD_NAME manquant dans .env). " +
          'Créez un compte gratuit sur cloudinary.com et renseignez les 3 clés dans apps/api/.env.',
      );
    }

    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    try {
      const result = await cloudinary.uploader.upload(base64, {
        folder: 'sthecroh',
        resource_type: 'auto', // détecte automatiquement image/vidéo/pdf
      });
      return { url: result.secure_url, resourceType: result.resource_type };
    } catch (err) {
      throw new InternalServerErrorException(
        `Échec de l'envoi vers Cloudinary : ${(err as Error).message}`,
      );
    }
  }
}
