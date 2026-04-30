import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EventItem, Paginated, Registration } from '../models';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly api = environment.apiUrl + '/events';
  private readonly regApi = environment.apiUrl + '/registrations';

  constructor(private http: HttpClient) {}

  list(opts: {
    page?: number;
    limit?: number;
    search?: string;
    organization?: string;
    upcoming?: boolean;
  } = {}): Observable<Paginated<EventItem>> {
    let params = new HttpParams();
    Object.entries(opts).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<Paginated<EventItem>>(this.api, { params });
  }

  get(id: string): Observable<EventItem> {
    return this.http.get<EventItem>(`${this.api}/${id}`);
  }

  create(form: FormData): Observable<EventItem> {
    return this.http.post<EventItem>(this.api, form);
  }

  update(id: string, form: FormData): Observable<EventItem> {
    return this.http.put<EventItem>(`${this.api}/${id}`, form);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.api}/${id}`);
  }

  registerForEvent(eventId: string): Observable<Registration> {
    return this.http.post<Registration>(`${this.regApi}/events/${eventId}`, {});
  }

  cancel(eventId: string): Observable<Registration> {
    return this.http.delete<Registration>(`${this.regApi}/events/${eventId}`);
  }

  myRegistrations(): Observable<{ items: Registration[] }> {
    return this.http.get<{ items: Registration[] }>(`${this.regApi}/me`);
  }

  eventRegistrations(eventId: string): Observable<{ items: Registration[] }> {
    return this.http.get<{ items: Registration[] }>(`${this.regApi}/events/${eventId}`);
  }
}
