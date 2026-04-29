import { environment } from '../../../environments/environment';

export function fileUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return environment.apiUrl + path;
}
