import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models';

const TOKEN_KEY = 'soms_token';
const USER_KEY = 'soms_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl + '/auth';
  private readonly _user = signal<User | null>(this.loadUser());
  readonly user$ = this._user.asReadonly();
  readonly isAuthSig = computed(() => this._user() !== null);

  constructor(private http: HttpClient) {
    if (this.token) {
      this.refreshMe().subscribe({
        error: (err: HttpErrorResponse) => {
          if (err.status === 401 || err.status === 404) this.clear();
        },
      });
    }
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
  get user(): User | null {
    return this._user();
  }
  get isAuthenticated(): boolean {
    return !!this.token && !!this._user();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/login`, { email, password })
      .pipe(tap((res) => this.persist(res)));
  }

  register(payload: Partial<User> & { password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/register`, payload)
      .pipe(tap((res) => this.persist(res)));
  }

  refreshMe(): Observable<User> {
    return this.http
      .get<User>(`${this.api}/me`)
      .pipe(tap((u) => this.setUser(u)));
  }

  setUser(u: User) {
    this._user.set(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }

  logout() {
    this.clear();
  }

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  private persist(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    this.setUser(res.user);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
