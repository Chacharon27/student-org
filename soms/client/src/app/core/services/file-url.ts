import { environment } from '../../../environments/environment';

export function fileUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (!environment.apiUrl) return path;
  const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
  return baseUrl + path;
}
