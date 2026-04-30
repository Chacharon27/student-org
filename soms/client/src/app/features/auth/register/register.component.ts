import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen grid place-items-center bg-slate-950 p-4">
      <div class="w-full max-w-lg card p-8">
        <a routerLink="/" class="flex items-center gap-3 font-extrabold text-brand-700 mb-6">
          <span class="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-400 text-white grid place-items-center shadow-lg">S</span>
          <span class="text-lg tracking-[0.16em]">SOMS</span>
        </a>
        <h1 class="text-2xl font-bold text-slate-900">Create your student account</h1>
        <p class="text-sm text-slate-500 mt-1">Admins cannot register here. Student accounts can join organizations and register for events.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-4">
          <div>
            <label class="label">Full name</label>
            <input class="input" formControlName="name" />
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="label">Email</label>
              <input class="input" type="email" formControlName="email" />
            </div>
            <div>
              <label class="label">Password</label>
              <input class="input" type="password" formControlName="password" />
              <p class="text-xs text-slate-400 mt-1">Min 8 characters.</p>
            </div>
          </div>
          <div class="grid sm:grid-cols-3 gap-4">
            <div>
              <label class="label">Student ID</label>
              <input class="input" formControlName="studentId" />
            </div>
            <div>
              <label class="label">Course</label>
              <input class="input" formControlName="course" />
            </div>
            <div>
              <label class="label">Year level</label>
              <input class="input" type="number" min="1" max="6" formControlName="yearLevel" />
            </div>
          </div>
          <button class="btn-primary w-full" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Creating…' : 'Create account' }}
          </button>
        </form>

        <p class="text-sm text-slate-500 mt-6 text-center">
          Already registered? <a routerLink="/login" class="text-brand-700 font-semibold">Sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = signal(false);
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    studentId: [''],
    course: [''],
    yearLevel: [1],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Account created!');
        this.router.navigateByUrl('/');
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
