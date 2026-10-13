import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Clean up Account ID in case the user pasted the full endpoint URL by mistake
const rawAccountId = process.env.R2_ACCOUNT_ID || '';
const accountId = rawAccountId.replace(/^https?:\/\//, '').replace(/\.r2\.cloudflarestorage\.com.*$/, '');

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function uploadToR2(
  fileBuffer: Buffer | Uint8Array,
  filename: string,
  contentType: string,
  folder: string = 'misc'
) {
  const fileExtension = filename.split('.').pop() || 'png';
  const key = `kalana/${folder}/${uuidv4()}.${fileExtension}`;
  const bucket = process.env.R2_BUCKET_NAME || 'kalana-media';

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await r2Client.send(command);
  const publicUrl = `/api/media/${key}`;

  return { key, publicUrl };
}

export async function generateUploadUrl(filename: string, contentType: string, folder: string = 'misc') {
  const fileExtension = filename.split('.').pop();
  const key = `kalana/${folder}/${uuidv4()}.${fileExtension}`;
  const bucket = process.env.R2_BUCKET_NAME || 'kalana-media';
  
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  const publicUrl = `/api/media/${key}`;

  return { uploadUrl, key, publicUrl };
}
