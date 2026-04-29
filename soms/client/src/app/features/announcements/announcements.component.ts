import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AnnouncementService } from '../../core/services/announcement.service';
import { OrganizationService } from '../../core/services/organization.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Announcement, Organization, Paginated } from '../../core/models';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Announcements</h1>
        <p class="text-sm text-slate-500">Latest updates from your campus.</p>
      </div>
      <button *ngIf="auth.user?.role === 'admin'" class="btn-primary" (click)="showForm.set(!showForm())">
        {{ showForm() ? 'Close form' : '+ New announcement' }}
      </button>
    </div>

    <div *ngIf="showForm()" class="card p-6 mb-6">
      <form [formGroup]="form" (ngSubmit)="create()" class="space-y-4">
        <div>
          <label class="label">Title</label>
          <input class="input" formControlName="title" />
        </div>
        <div>
          <label class="label">Organization (optional)</label>
          <select class="input" formControlName="organization">
            <option value="">Campus-wide</option>
            <option *ngFor="let o of orgs()" [value]="o._id">{{ o.name }}</option>
          </select>
        </div>
        <div>
          <label class="label">Body</label>
          <textarea class="input min-h-[120px]" formControlName="body"></textarea>
        </div>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" formControlName="pinned" /> Pin to top
        </label>
        <div class="flex justify-end">
          <button class="btn-primary" [disabled]="form.invalid || creating">
            {{ creating ? 'Posting…' : 'Post announcement' }}
          </button>
        </div>
      </form>
    </div>

    <div *ngIf="loading()" class="text-sm text-slate-500">Loading…</div>

    <ul class="space-y-4">
      <li *ngFor="let a of data()?.items" class="card p-5">
        <div class="flex items-start gap-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span *ngIf="a.pinned" class="badge bg-amber-100 text-amber-800">Pinned</span>
              <h3 class="font-bold text-slate-900">{{ a.title }}</h3>
            </div>
            <p class="text-sm text-slate-600 whitespace-pre-line">{{ a.body }}</p>
            <p class="text-xs text-slate-400 mt-2">{{ a.createdAt | date:'medium' }}</p>
          </div>
          <button *ngIf="auth.user?.role === 'admin'" class="text-xs text-red-600 hover:underline" (click)="remove(a._id)">Delete</button>
        </div>
      </li>
    </ul>

    <div *ngIf="data()" class="flex items-center justify-between mt-6 text-sm">
      <span class="text-slate-500">Page {{ data()!.page }} of {{ data()!.pages || 1 }}</span>
      <div class="flex gap-2">
        <button class="btn-secondary" [disabled]="data()!.page <= 1" (click)="setPage(data()!.page - 1)">Prev</button>
        <button class="btn-secondary" [disabled]="data()!.page >= data()!.pages" (click)="setPage(data()!.page + 1)">Next</button>
      </div>
    </div>
  `,
})
export class AnnouncementsComponent implements OnInit {
  private svc = inject(AnnouncementService);
  private orgSvc = inject(OrganizationService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  protected readonly auth = inject(AuthService);

  data = signal<Paginated<Announcement> | null>(null);
  orgs = signal<Organization[]>([]);
  loading = signal(false);
  page = signal(1);
  showForm = signal(false);
  creating = false;

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    body: ['', [Validators.required, Validators.minLength(5)]],
    organization: [''],
    pinned: [false],
  });

  ngOnInit() {
    this.load();
    if (this.auth.user?.role === 'admin') {
      this.orgSvc.list({ limit: 100 }).subscribe((r) => this.orgs.set(r.items));
    }
  }

  setPage(p: number) { this.page.set(p); this.load(); }

  load() {
    this.loading.set(true);
    this.svc.list({ page: this.page(), limit: 10 }).subscribe({
      next: (res) => { this.data.set(res); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  create() {
    if (this.form.invalid) return;
    this.creating = true;
    const v = this.form.getRawValue();
    const payload: any = { title: v.title, body: v.body, pinned: v.pinned };
    if (v.organization) payload.organization = v.organization;
    this.svc.create(payload).subscribe({
      next: () => {
        this.toast.success('Announcement posted');
        this.form.reset({ pinned: false } as any);
        this.showForm.set(false);
        this.load();
      },
      complete: () => (this.creating = false),
      error: () => (this.creating = false),
    });
  }

  remove(id: string) {
    if (!confirm('Delete this announcement?')) return;
    this.svc.delete(id).subscribe(() => { this.toast.success('Deleted'); this.load(); });
  }
}
