import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AnnouncementService } from '../../core/services/announcement.service';
import { OrganizationService } from '../../core/services/organization.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Announcement, Organization, Paginated } from '../../core/models';
import { fileUrl } from '../../core/services/file-url';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Announcements</h1>
        <p class="text-sm text-slate-300">Latest updates from your campus.</p>
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
        <div>
          <label class="label">Photo (optional)</label>
          <input type="file" accept="image/*" (change)="onFile($event)" class="text-sm text-slate-700 file:mr-3 file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-900" />
        </div>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" formControlName="pinned" /> Pin to top
        </label>
        <div class="flex justify-end">
          <button class="btn-primary" [disabled]="form.invalid || creating()">
            {{ creating() ? 'Posting...' : 'Post announcement' }}
          </button>
        </div>
      </form>
    </div>

    <div *ngIf="loading()" class="text-sm text-slate-300">Loading...</div>

    <ul class="space-y-4">
      <li *ngFor="let a of data()?.items" class="card p-5">
        <div class="flex items-start gap-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span *ngIf="a.pinned" class="badge bg-amber-100 text-amber-800">Pinned</span>
              <h3 class="font-bold text-slate-900">{{ a.title }}</h3>
            </div>
            <img *ngIf="a.imageUrl" [src]="fileUrl(a.imageUrl)" class="my-3 w-full max-h-80 rounded-lg object-cover border border-slate-100" alt="" />
            <p class="text-sm text-slate-600 whitespace-pre-line">{{ a.body }}</p>
            <p class="text-xs text-slate-400 mt-2">{{ a.createdAt | date:'medium' }}</p>
          </div>
          <button *ngIf="auth.user?.role === 'admin'" class="text-xs text-red-600 hover:underline" (click)="remove(a._id)">Delete</button>
        </div>
      </li>
    </ul>

    <div *ngIf="data()" class="flex items-center justify-between mt-6 text-sm">
      <span class="text-slate-300">Page {{ data()!.page }} of {{ data()!.pages || 1 }}</span>
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
  protected readonly fileUrl = fileUrl;

  data = signal<Paginated<Announcement> | null>(null);
  orgs = signal<Organization[]>([]);
  loading = signal(false);
  page = signal(1);
  showForm = signal(false);
  creating = signal(false);
  file: File | null = null;

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

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    this.file = input.files?.[0] ?? null;
  }

  load() {
    this.loading.set(true);
    this.svc.list({ page: this.page(), limit: 10 }).subscribe({
      next: (res) => { this.data.set(res); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  create() {
    if (this.form.invalid) return;
    this.creating.set(true);
    const v = this.form.getRawValue();
    const fd = new FormData();
    fd.append('title', v.title);
    fd.append('body', v.body);
    fd.append('pinned', String(v.pinned));
    if (v.organization) fd.append('organization', v.organization);
    if (this.file) fd.append('photo', this.file);
    this.svc.create(fd).subscribe({
      next: () => {
        this.toast.success('Announcement posted');
        this.form.reset({ pinned: false } as any);
        this.file = null;
        this.showForm.set(false);
        this.load();
      },
      complete: () => this.creating.set(false),
      error: () => this.creating.set(false),
    });
  }

  remove(id: string) {
    if (!confirm('Delete this announcement?')) return;
    this.svc.delete(id).subscribe(() => { this.toast.success('Deleted'); this.load(); });
  }
}
