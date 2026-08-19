import { env } from './env';

type ImageSize = 'thumb' | 'card' | 'detail' | 'hero' | 'original';
type Bucket = 'media' | 'site-assets';

/**
 * Builds a public Supabase Storage URL for an image.
 *
 * PATH CONVENTION (fixed in migration 015):
 *   images[].path in the DB stores the path WITHOUT the bucket prefix.
 *   e.g. "properties/<uuid>/hero.webp" (not "media/properties/...")
 *
 * If the path accidentally still has a "media/" prefix (older seeded data
 * before migration 015 runs), this function strips it to avoid double-prefix.
 */
export function imageUrl(
  path: string | null | undefined,
  _size: ImageSize = 'card',
  bucket: Bucket = 'media'
): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  let cleanPath = path.replace(/^\/+/, '');
  if (cleanPath.startsWith(`${bucket}/`)) {
    cleanPath = cleanPath.slice(bucket.length + 1);
  }

  const base = env.SUPABASE_URL.replace(/\/+$/, '');
  const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
  return `${base}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

export function isDocumentPath(path: string | null | undefined): boolean {
  return !!path && path.startsWith('documents/');
}

export function getHeroImage<T extends { path: string; alt: string; sort: number }>(
  images: T[] | null | undefined
): T | null {
  if (!images || images.length === 0) return null;
  return [...images].sort((a, b) => a.sort - b.sort)[0] ?? null;
}
