import { environment } from '../../../environments/environment';

export function fileUrl(path?: string | null): string {
  if (!path) return '';
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  if (!environment.apiUrl) return path;
  const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
  return baseUrl + path;
}
