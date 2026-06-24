import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import sharp from 'sharp';
import { env } from '../config/env';

fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Only JPEG, PNG and WEBP images are allowed'));
  }
});

export const upload = imageUpload;

export const profilePhotoUpload = imageUpload.single('photo');

export const vehiclePhotoUpload = imageUpload.fields([
  { name: 'frontPhoto', maxCount: 1 },
  { name: 'backPhoto', maxCount: 1 }
]);

export const processVehiclePhoto = (buffer: Buffer) => {
  return sharp(buffer).resize(1200, 900, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
};

export const processProfilePhoto = (buffer: Buffer) => {
  return sharp(buffer).resize(400, 400, { fit: 'cover', position: 'center' }).webp({ quality: 84 }).toBuffer();
};

export const saveToUploads = async (buffer: Buffer, userId: string, filename: string) => {
  const userDir = path.join(env.UPLOAD_DIR, userId);
  await fs.promises.mkdir(userDir, { recursive: true });
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
  const filePath = path.join(userDir, safeName);
  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/${userId}/${safeName}`;
};
