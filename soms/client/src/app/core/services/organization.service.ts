import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Member, Organization, Paginated } from '../models';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly api = environment.apiUrl + '/organizations';

  constructor(private http: HttpClient) {}

  list(opts: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Observable<Paginated<Organization>> {
    let params = new HttpParams();
    Object.entries(opts).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<Paginated<Organization>>(this.api, { params });
  }

  get(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.api}/${id}`);
  }

  create(form: FormData): Observable<Organization> {
    return this.http.post<Organization>(this.api, form);
  }

  update(id: string, form: FormData): Observable<Organization> {
    return this.http.put<Organization>(`${this.api}/${id}`, form);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.api}/${id}`);
  }

  members(orgId: string): Observable<{ items: Member[] }> {
    return this.http.get<{ items: Member[] }>(`${this.api}/${orgId}/members`);
  }

  join(orgId: string): Observable<Member> {
    return this.http.post<Member>(`${this.api}/${orgId}/join`, {});
  }

  updateMember(
    orgId: string,
    memberId: string,
    body: Partial<Member>,
  ): Observable<Member> {
    return this.http.put<Member>(`${this.api}/${orgId}/members/${memberId}`, body);
  }

  removeMember(orgId: string, memberId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.api}/${orgId}/members/${memberId}`,
    );
  }
}
