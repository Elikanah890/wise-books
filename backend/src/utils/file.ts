import fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from '../lib/logger';

/**
 * Deletes an uploaded file that is stored as a path relative to the project root.
 * Missing files are ignored; failures are logged but never thrown.
 */
export async function deleteUploadedFile(relativePath: string): Promise<void> {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') {
      logger.warn({ err: error, relativePath }, 'Failed to delete uploaded file');
    }
  }
}
