import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';
import { fileUrl } from '../core/services/file-url';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header class="bg-slate-950 border-b border-slate-800 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-6">
          <a routerLink="/" class="flex items-center gap-3 font-extrabold text-white min-w-0">
            <img src="student-org-logo.svg" class="w-11 h-11 rounded-xl object-cover shadow-lg shrink-0" alt="Student Organization Management System" />
            <span class="hidden lg:inline text-base tracking-normal whitespace-nowrap">Student Organization Management System</span>
            <span class="hidden sm:inline lg:hidden text-lg tracking-normal">Student Org</span>
          </a>
          <nav class="hidden md:flex items-center gap-1 text-sm font-medium">
            <a routerLink="/" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="text-white bg-slate-900"
               class="px-3 py-2 rounded-2xl text-slate-300 hover:text-white">Dashboard</a>
            <a routerLink="/organizations" routerLinkActive="text-white bg-slate-900"
               class="px-3 py-2 rounded-2xl text-slate-300 hover:text-white">Organizations</a>
            <a routerLink="/events" routerLinkActive="text-white bg-slate-900"
               class="px-3 py-2 rounded-2xl text-slate-300 hover:text-white">Events</a>
            <a routerLink="/announcements" routerLinkActive="text-white bg-slate-900"
               class="px-3 py-2 rounded-2xl text-slate-300 hover:text-white">Announcements</a>
            <a *ngIf="auth.user?.role === 'admin'" routerLink="/admin/members" routerLinkActive="text-white bg-slate-900"
               class="px-3 py-2 rounded-2xl text-slate-300 hover:text-white">Members</a>
          </nav>
          <div class="ml-auto flex items-center gap-3">
            <ng-container *ngIf="auth.user; else guestTpl">
              <a routerLink="/profile" class="flex items-center gap-3">
                <img *ngIf="auth.user.avatarUrl" [src]="fileUrl(auth.user.avatarUrl)" class="w-9 h-9 rounded-full object-cover" alt="" />
                <span *ngIf="!auth.user.avatarUrl" class="w-9 h-9 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-semibold">
                  {{ auth.user.name[0] }}
                </span>
                <span class="hidden sm:block text-sm">
                  <span class="font-semibold text-white">{{ auth.user.name }}</span>
                  <span class="block text-xs text-slate-400 capitalize">{{ auth.user.role }}</span>
                </span>
              </a>
              <button class="btn-secondary" (click)="logout()">Logout</button>
            </ng-container>
            <ng-template #guestTpl>
              <a routerLink="/login" class="btn-secondary">Login</a>
              <a routerLink="/register" class="btn-primary">Sign up</a>
            </ng-template>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <router-outlet />
      </main>

      <footer class="bg-slate-950 border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        © {{ year }} Student Organization Management System
      </footer>

      <!-- toasts -->
      <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <div *ngFor="let t of toast.toasts()" class="card bg-slate-900 text-slate-100 border-slate-800 px-4 py-3 min-w-[260px] flex items-start gap-3"
             [class.border-l-4]="true"
             [class.border-green-500]="t.type==='success'"
             [class.border-red-500]="t.type==='error'"
             [class.border-brand-500]="t.type==='info'">
          <span class="text-sm flex-1">{{ t.message }}</span>
          <button class="text-slate-400 hover:text-slate-100" (click)="toast.dismiss(t.id)">×</button>
        </div>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  protected readonly auth = inject(AuthService);
  protected readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  protected readonly year = new Date().getFullYear();
  protected readonly fileUrl = fileUrl;

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
