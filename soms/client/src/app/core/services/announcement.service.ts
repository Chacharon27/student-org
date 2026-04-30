import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Announcement, Paginated } from '../models';

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private readonly api = environment.apiUrl + '/api/announcements';

  constructor(private http: HttpClient) {}

  list(opts: {
    page?: number;
    limit?: number;
    search?: string;
    organization?: string;
  } = {}): Observable<Paginated<Announcement>> {
    let params = new HttpParams();
    Object.entries(opts).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<Paginated<Announcement>>(this.api, { params });
  }

  create(body: Partial<Announcement> | FormData): Observable<Announcement> {
    return this.http.post<Announcement>(this.api, body);
  }

  update(id: string, body: Partial<Announcement> | FormData): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.api}/${id}`, body);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.api}/${id}`);
  }
}
