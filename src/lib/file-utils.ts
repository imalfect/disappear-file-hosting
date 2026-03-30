const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp',
]);

export function isStrippableImage(file: File): boolean {
  if (IMAGE_TYPES.has(file.type)) return true;
  const ext = file.name.includes('.')
    ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    : '';
  return IMAGE_EXTENSIONS.has(ext);
}

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function resolveImageMime(file: File): string {
  if (IMAGE_TYPES.has(file.type)) return file.type;
  const ext = file.name.includes('.')
    ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    : '';
  return EXT_TO_MIME[ext] || 'image/png';
}

export async function stripMetadata(file: File): Promise<File> {
  if (!isStrippableImage(file)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('could not decode image — file may be corrupt');
  }

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('could not create canvas context');
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const mime = resolveImageMime(file);
  const quality = mime === 'image/png' ? undefined : 0.95;

  const blob = await canvas.convertToBlob({ type: mime, quality });
  return new File([blob], file.name, { type: mime, lastModified: Date.now() });
}

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function randomizeFileName(name: string): string {
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
  const random = Array.from(
    crypto.getRandomValues(new Uint8Array(12)),
    (b) => CHARS[b % CHARS.length],
  ).join('');
  return `${random}${ext}`;
}
