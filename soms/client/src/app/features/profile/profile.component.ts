import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { EventService } from '../../core/services/event.service';
import { ToastService } from '../../core/services/toast.service';
import { Registration } from '../../core/models';
import { fileUrl } from '../../core/services/file-url';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<h1 class="text-2xl font-bold text-slate-900 mb-6">MY PROFILE</h1>

    <div class="grid lg:grid-cols-3 gap-6">
      <div class="card p-6 lg:col-span-1">
        <div class="flex flex-col items-center text-center">
          <img *ngIf="auth.user?.avatarUrl; else fb" [src]="fileUrl(auth.user!.avatarUrl)" class="w-24 h-24 rounded-full object-cover" alt="" />
          <ng-template #fb>
            <div class="w-24 h-24 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-extrabold text-3xl">
              {{ auth.user?.name?.[0] }}
            </div>
          </ng-template>
          <h2 class="mt-3 font-bold text-slate-900">{{ auth.user?.name }}</h2>
          <p class="text-sm text-slate-500">{{ auth.user?.email }}</p>
          <span class="badge bg-brand-100 text-brand-700 mt-2 capitalize">{{ auth.user?.role }}</span>

          <label class="btn-secondary mt-4 cursor-pointer">
            <input type="file" accept="image/*" hidden (change)="onAvatar($event)" />
            Upload avatar
          </label>
        </div>
      </div>

      <div class="card p-6 lg:col-span-2">
        <h2 class="font-bold text-slate-900 mb-4">Edit details</h2>
        <form [formGroup]="form" (ngSubmit)="save()" class="grid sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="label">Full name</label>
            <input class="input" formControlName="name" />
          </div>
          <div>
            <label class="label">Student ID</label>
            <input class="input" formControlName="studentId" />
          </div>
          <div>
            <label class="label">Year level</label>
            <input class="input" type="number" min="1" max="6" formControlName="yearLevel" />
          </div>
          <div class="sm:col-span-2">
            <label class="label">Course</label>
            <input class="input" formControlName="course" />
          </div>
          <div class="sm:col-span-2 flex justify-end">
            <button class="btn-primary" [disabled]="saving">{{ saving ? 'Saving...' : 'Save changes' }}</button>
          </div>
        </form>
      </div>

      <div class="card p-6 lg:col-span-3">
        <h2 class="font-bold text-slate-900 mb-4">My event registrations</h2>
        <div *ngIf="regs().length === 0" class="text-sm text-slate-500">No registrations yet.</div>
        <ul class="divide-y divide-slate-100">
          <li *ngFor="let r of regs()" class="py-3 flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-brand-100 text-brand-700 grid place-items-center text-center leading-none shrink-0">
              <div>
                <div class="text-xs">{{ r.event.startsAt | date:'MMM' }}</div>
                <div class="font-bold">{{ r.event.startsAt | date:'d' }}</div>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-slate-900 truncate">{{ r.event.title }}</p>
              <p class="text-xs text-slate-500">{{ r.event.location }} - {{ r.event.startsAt | date:'medium' }}</p>
            </div>
            <span class="badge"
                  [class.bg-green-100]="r.status==='registered'" [class.text-green-700]="r.status==='registered'"
                  [class.bg-slate-100]="r.status==='cancelled'" [class.text-slate-600]="r.status==='cancelled'"
                  [class.bg-brand-100]="r.status==='attended'" [class.text-brand-700]="r.status==='attended'">
              {{ r.status }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private users = inject(UserService);
  private events = inject(EventService);
  private toast = inject(ToastService);
  protected readonly fileUrl = fileUrl;

  saving = false;
  regs = signal<Registration[]>([]);
  form = this.fb.nonNullable.group({
    name: [this.auth.user?.name ?? ''],
    studentId: [this.auth.user?.studentId ?? ''],
    course: [this.auth.user?.course ?? ''],
    yearLevel: [this.auth.user?.yearLevel ?? 1],
  });

  ngOnInit() {
    this.events.myRegistrations().subscribe((r) => this.regs.set(r.items));
  }

  save() {
    this.saving = true;
    this.users.updateMe(this.form.getRawValue()).subscribe({
      next: (u) => { this.auth.setUser(u); this.toast.success('Profile updated'); },
      complete: () => (this.saving = false),
      error: () => (this.saving = false),
    });
  }

  onAvatar(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.users.uploadAvatar(file).subscribe({
      next: (u) => { this.auth.setUser(u); this.toast.success('Avatar updated'); },
    });
  }
}
