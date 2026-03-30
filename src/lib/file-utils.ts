const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export function isStrippableImage(file: File): boolean {
  return IMAGE_TYPES.has(file.type);
}

export async function stripMetadata(file: File): Promise<File> {
  if (!isStrippableImage(file)) return file;

  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const mimeMap: Record<string, string> = {
    'image/jpeg': 'image/jpeg',
    'image/png': 'image/png',
    'image/webp': 'image/webp',
  };
  const mime = mimeMap[file.type] || 'image/png';
  const quality = file.type === 'image/png' ? undefined : 0.95;

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
