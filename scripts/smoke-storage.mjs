import dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

dotenv.config({ path: '.env.local' });
const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_ENDPOINT_URL_S3', 'AWS_REGION'];
for (const key of required) if (!process.env[key]) throw new Error(`${key} no está configurada.`);

const bucket = 'assets';
const key = `smoke/${randomUUID()}.txt`;
const payload = `Neon Object Storage smoke test ${new Date().toISOString()}`;
const s3 = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  region: process.env.AWS_REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

try {
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: payload, ContentType: 'text/plain' }));
  const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const actual = await object.Body.transformToString();
  if (actual !== payload) throw new Error('El objeto leído no coincide con el que se escribió.');
  console.log('Neon Object Storage OK: objeto de prueba escrito y leído.');
} finally {
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    console.log('Objeto de prueba eliminado.');
  } catch {
    console.error('No se pudo limpiar el objeto de prueba; elimina el objeto con prefijo smoke/ del bucket assets.');
  }
  s3.destroy();
}
