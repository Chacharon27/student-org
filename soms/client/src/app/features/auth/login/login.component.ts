import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen grid place-items-center bg-slate-950 p-4">
      <div class="w-full max-w-md card p-8">
        <a routerLink="/" class="flex items-center gap-3 font-extrabold text-brand-700 mb-6">
          <img src="student-org-logo.svg" alt="Student Organization Management System" class="w-11 h-11 rounded-2xl object-cover shadow-lg" />
          <span class="text-lg tracking-[0.16em]">Student Organization Management System</span>
        </a>
        <h1 class="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p class="text-sm text-slate-500 mt-1">Sign in to manage your student organization workflow.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-4">
          <div class="border border-slate-800 rounded-2xl p-4 bg-slate-900">
            <p class="text-sm text-slate-400 mb-3">Signing in as:</p>
            <div class="flex flex-wrap gap-3">
              <label class="inline-flex items-center gap-2 text-sm text-slate-200">
                <input type="radio" formControlName="role" name="role" value="student" />
                Student
              </label>
              <label class="inline-flex items-center gap-2 text-sm text-slate-200">
                <input type="radio" formControlName="role" name="role" value="admin" />
                Admin
              </label>
            </div>
            <p *ngIf="form.controls.role.value === 'admin'" class="text-sm text-brand-500 mt-3">
              Use your admin account to post announcements and manage all features.
            </p>
            <p *ngIf="form.controls.role.value === 'student'" class="text-sm text-slate-400 mt-3">
              Use your student account to view events, organizations, and register for activities.
            </p>
          </div>

          <div>
            <label class="label">Email</label>
            <input class="input" type="email" formControlName="email" />
            <p *ngIf="form.controls.email.touched && form.controls.email.invalid"
               class="text-xs text-red-600 mt-1">Valid email required.</p>
          </div>
          <div>
            <label class="label">Password</label>
            <input class="input" type="password" formControlName="password" />
            <p *ngIf="form.controls.password.touched && form.controls.password.invalid"
               class="text-xs text-red-600 mt-1">Password required.</p>
          </div>
          <button class="btn-primary w-full" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="text-sm text-slate-500 mt-6 text-center">
          No account? <a routerLink="/register" class="text-brand-700 font-semibold">Create one</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  loading = signal(false);
  form = this.fb.nonNullable.group({
    role: ['student'],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(1)]],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/';
        this.router.navigateByUrl(redirect);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}

