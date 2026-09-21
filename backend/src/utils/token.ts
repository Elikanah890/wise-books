import crypto from 'node:crypto';

export function generateDownloadToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateFileName(originalName: string): string {
  const extension = originalName.includes('.')
    ? originalName.slice(originalName.lastIndexOf('.')).toLowerCase()
    : '';
  return `${crypto.randomUUID()}${extension}`;
}
