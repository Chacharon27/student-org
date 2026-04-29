import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen grid place-items-center bg-gradient-to-br from-brand-50 via-white to-slate-100 p-4">
      <div class="w-full max-w-md card p-8">
        <a routerLink="/" class="flex items-center gap-2 font-extrabold text-brand-700 mb-6">
          <span class="w-9 h-9 rounded-lg bg-brand-600 text-white grid place-items-center">S</span>
          <span>SOMS</span>
        </a>
        <h1 class="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p class="text-sm text-slate-500 mt-1">Sign in to manage your organizations.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-4">
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
          <button class="btn-primary w-full" [disabled]="form.invalid || loading">
            {{ loading ? 'Signing in…' : 'Sign in' }}
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

  loading = false;
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(1)]],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/';
        this.router.navigateByUrl(redirect);
      },
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }
}
