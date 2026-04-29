import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paginated, User } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = environment.apiUrl + '/api/users';

  constructor(private http: HttpClient) {}

  list(opts: { page?: number; limit?: number; search?: string } = {}): Observable<
    Paginated<User>
  > {
    let params = new HttpParams();
    Object.entries(opts).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<Paginated<User>>(this.api, { params });
  }

  updateMe(body: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.api}/me`, body);
  }

  uploadAvatar(file: File): Observable<User> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<User>(`${this.api}/me/avatar`, fd);
  }
}
