import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { EventService } from '../../core/services/event.service';
import { OrganizationService } from '../../core/services/organization.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { EventItem, Organization, Paginated } from '../../core/models';
import { fileUrl } from '../../core/services/file-url';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center justify-between gap-4 mb-5 md:mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Events</h1>
        <p class="text-sm text-slate-300">Discover what's happening on campus.</p>
      </div>
      <button *ngIf="auth.user?.role === 'admin'" class="btn-primary" (click)="showForm.set(!showForm())">
        {{ showForm() ? 'Close form' : '+ New event' }}
      </button>
    </div>

    <div *ngIf="showForm()" class="card p-4 sm:p-6 mb-6">
      <form [formGroup]="form" (ngSubmit)="save()" class="grid md:grid-cols-2 gap-3 sm:gap-4">
        <div class="md:col-span-2">
          <label class="label">Title</label>
          <input class="input" formControlName="title" />
        </div>
        <div>
          <label class="label">Organization</label>
          <select class="input" formControlName="organization">
            <option value="">Select…</option>
            <option *ngFor="let o of orgs()" [value]="o._id">{{ o.name }}</option>
          </select>
        </div>
        <div>
          <label class="label">Capacity</label>
          <input class="input" type="number" min="0" formControlName="capacity" />
        </div>
        <div>
          <label class="label">Starts at</label>
          <input class="input" type="datetime-local" formControlName="startsAt" />
        </div>
        <div>
          <label class="label">Ends at</label>
          <input class="input" type="datetime-local" formControlName="endsAt" />
        </div>
        <div class="md:col-span-2">
          <label class="label">Location</label>
          <input class="input" formControlName="location" />
        </div>
        <div class="md:col-span-2">
          <label class="label">Description</label>
          <textarea class="input min-h-[100px]" formControlName="description"></textarea>
        </div>
        <div class="md:col-span-2">
          <label class="label">Poster {{ editingId() ? '(choose a new file to replace)' : '(optional)' }}</label>
          <input type="file" accept="image/*" (change)="onFile($event)" class="text-sm" />
        </div>
        <div class="md:col-span-2 flex flex-wrap justify-end gap-2">
          <button *ngIf="editingId()" type="button" class="btn-secondary" (click)="resetForm()">Cancel edit</button>
          <button class="btn-primary" [disabled]="form.invalid || creating()">
            {{ creating() ? 'Saving...' : (editingId() ? 'Update event' : 'Create event') }}
          </button>
        </div>
      </form>
    </div>

    <div class="card p-4 mb-4 grid sm:flex items-center gap-3">
      <input class="input" placeholder="Search events…" [ngModel]="search()" (ngModelChange)="onSearch($event)" />
      <label class="flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap">
        <input type="checkbox" [ngModel]="upcoming()" (ngModelChange)="upcoming.set($event); page.set(1); load()" />
        Upcoming only
      </label>
    </div>

    <div *ngIf="loading()" class="text-sm text-slate-300">Loading...</div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <a *ngFor="let e of data()?.items" [routerLink]="['/events', e._id]" class="card overflow-hidden hover:shadow-md transition">
        <div class="h-40 sm:h-36 bg-brand-100 relative">
          <img *ngIf="e.posterUrl" [src]="fileUrl(e.posterUrl)" class="w-full h-full object-cover" alt="" />
          <span class="absolute top-3 left-3 bg-white/90 text-slate-900 text-xs px-2 py-1 rounded-full font-semibold">
            {{ e.startsAt | date:'MMM d, y' }}
          </span>
        </div>
        <div class="p-4">
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-slate-900 line-clamp-1">{{ e.title }}</h3>
            <button *ngIf="auth.user?.role === 'admin'" class="text-xs text-brand-700 hover:underline shrink-0"
                    (click)="edit(e); $event.preventDefault(); $event.stopPropagation()">Edit</button>
          </div>
          <p class="text-xs text-slate-500 mt-1">📍 {{ e.location }}</p>
          <p class="text-sm text-slate-600 mt-2 line-clamp-2">{{ e.description }}</p>
        </div>
      </a>
    </div>

    <div *ngIf="data()" class="flex items-center justify-between mt-6 text-sm">
      <span class="text-slate-300">Page {{ data()!.page }} of {{ data()!.pages || 1 }} ({{ data()!.total }} total)</span>
      <div class="flex gap-2">
        <button class="btn-secondary" [disabled]="data()!.page <= 1" (click)="setPage(data()!.page - 1)">Prev</button>
        <button class="btn-secondary" [disabled]="data()!.page >= data()!.pages" (click)="setPage(data()!.page + 1)">Next</button>
      </div>
    </div>
  `,
})
export class EventsComponent implements OnInit {
  private svc = inject(EventService);
  private orgSvc = inject(OrganizationService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  protected readonly auth = inject(AuthService);
  protected readonly fileUrl = fileUrl;

  data = signal<Paginated<EventItem> | null>(null);
  orgs = signal<Organization[]>([]);
  loading = signal(false);
  search = signal('');
  upcoming = signal(false);
  page = signal(1);
  showForm = signal(false);
  creating = signal(false);
  editingId = signal<string | null>(null);
  file: File | null = null;
  private search$ = new Subject<string>();

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    organization: ['', Validators.required],
    startsAt: ['', Validators.required],
    endsAt: ['', Validators.required],
    location: ['', Validators.required],
    capacity: [0],
  });

  ngOnInit() {
    this.search$
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((s) => { this.search.set(s); this.page.set(1); this.load(); });
    this.load();
    if (this.auth.user?.role === 'admin') {
      this.orgSvc.list({ limit: 100 }).subscribe((r) => this.orgs.set(r.items));
    }
  }

  onSearch(v: string) { this.search$.next(v); }
  setPage(p: number) { this.page.set(p); this.load(); }

  load() {
    this.loading.set(true);
    this.svc.list({
      page: this.page(),
      limit: 9,
      search: this.search(),
      upcoming: this.upcoming(),
    }).subscribe({
      next: (res) => { this.data.set(res); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    this.file = input.files?.[0] ?? null;
  }

  save() {
    if (this.form.invalid) return;
    this.creating.set(true);
    const fd = new FormData();
    Object.entries(this.form.getRawValue()).forEach(([k, v]) =>
      fd.append(k, String(v)),
    );
    if (this.file) fd.append('poster', this.file);
    const id = this.editingId();
    const request = id ? this.svc.update(id, fd) : this.svc.create(fd);
    request.subscribe({
      next: () => {
        this.toast.success(id ? 'Event updated' : 'Event created');
        this.resetForm();
        this.load();
      },
      complete: () => this.creating.set(false),
      error: () => this.creating.set(false),
    });
  }

  edit(event: EventItem) {
    this.editingId.set(event._id);
    this.showForm.set(true);
    this.file = null;
    this.form.reset({
      title: event.title,
      description: event.description,
      organization: typeof event.organization === 'string' ? event.organization : event.organization?._id ?? '',
      startsAt: this.toLocalDateTime(event.startsAt),
      endsAt: this.toLocalDateTime(event.endsAt),
      location: event.location,
      capacity: event.capacity ?? 0,
    } as any);
  }

  resetForm() {
    this.form.reset({ capacity: 0 } as any);
    this.file = null;
    this.editingId.set(null);
    this.showForm.set(false);
  }

  private toLocalDateTime(value: string | Date): string {
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }
}
