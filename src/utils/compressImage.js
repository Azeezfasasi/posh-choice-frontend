// Resize/compress images in the browser before upload so requests stay small
// (the backend host limits request bodies to ~4.5MB in total).

const MAX_DIMENSION = 1600;
const QUALITY = 0.82;
const SKIP_BELOW_BYTES = 400 * 1024;

const canvasToBlob = (canvas, type) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));

/**
 * @param {File} file
 * @returns {Promise<File>} a smaller WebP/JPEG file, or the original if compression isn't possible/useful
 */
export async function compressImage(file) {
  if (!(file instanceof File) || !file.type.startsWith('image/')) return file;
  // GIFs may be animated and SVGs are vectors; leave them alone
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  if (file.size <= SKIP_BELOW_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    // WebP keeps transparency; browsers that can't encode WebP fall back to PNG, so use JPEG then
    let blob = await canvasToBlob(canvas, 'image/webp');
    let ext = 'webp';
    if (!blob || blob.type !== 'image/webp') {
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      blob = await canvasToBlob(canvas, 'image/jpeg');
      ext = 'jpg';
    }
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${baseName}.${ext}`, { type: blob.type, lastModified: Date.now() });
  } catch {
    return file;
  }
}

export const compressImages = (files) => Promise.all(Array.from(files || []).map(compressImage));
