import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { OrganizationService } from '../../core/services/organization.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Organization, Paginated } from '../../core/models';
import { fileUrl } from '../../core/services/file-url';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center justify-between gap-4 mb-5">
      <div>
        <h1 class="text-2xl font-bold text-white">Organizations</h1>
        <p class="text-sm text-slate-300">Discover and join student organizations on campus.</p>
      </div>
      <button *ngIf="auth.user?.role === 'admin'" class="btn-primary" (click)="showForm.set(!showForm())">
        {{ showForm() ? 'Close form' : '+ New organization' }}
      </button>
    </div>

    <div *ngIf="showForm()" class="card p-4 sm:p-5 mb-5">
      <form [formGroup]="form" (ngSubmit)="create()" class="grid md:grid-cols-2 gap-3">
        <div>
          <label class="label">Name</label>
          <input class="input" formControlName="name" />
        </div>
        <div>
          <label class="label">Category</label>
          <input class="input" formControlName="category" placeholder="Academic, Cultural..." />
        </div>
        <div class="md:col-span-2">
          <label class="label">Description</label>
          <textarea class="input min-h-[72px]" rows="3" formControlName="description"></textarea>
        </div>
        <div>
          <label class="label">Logo (optional)</label>
          <input type="file" accept="image/*" (change)="onFile($event)" class="text-sm text-slate-700 file:mr-3 file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-900" />
        </div>
        <div class="flex items-end justify-stretch sm:justify-end">
          <button class="btn-primary" [disabled]="form.invalid || creating()">
            {{ creating() ? 'Saving...' : 'Create' }}
          </button>
        </div>
      </form>
    </div>

    <div class="card p-4 mb-4 flex items-center gap-3">
      <input class="input" placeholder="Search organizations..." [ngModel]="search()" (ngModelChange)="onSearch($event)" />
    </div>

    <div *ngIf="loading()" class="text-sm text-slate-300">Loading...</div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <a *ngFor="let o of data()?.items" [routerLink]="['/organizations', o._id]"
         class="card p-4 sm:p-5 hover:shadow-md transition flex gap-3 sm:gap-4">
        <img *ngIf="o.logoUrl; else fb" [src]="fileUrl(o.logoUrl)" class="w-14 h-14 rounded-lg object-cover" alt="" />
        <ng-template #fb>
          <div class="w-14 h-14 rounded-lg bg-brand-100 text-brand-700 grid place-items-center font-bold text-lg">
            {{ o.name[0] }}
          </div>
        </ng-template>
        <div class="min-w-0">
          <h3 class="font-semibold text-slate-900 truncate">{{ o.name }}</h3>
          <p class="text-xs text-brand-700 font-medium">{{ o.category }}</p>
          <p class="text-sm text-slate-500 mt-1 line-clamp-2">{{ o.description }}</p>
        </div>
      </a>
    </div>

    <div *ngIf="data()" class="grid sm:flex items-center justify-between gap-3 mt-6 text-sm">
      <span class="text-slate-300">Page {{ data()!.page }} of {{ data()!.pages || 1 }} ({{ data()!.total }} total)</span>
      <div class="flex gap-2">
        <button class="btn-secondary" [disabled]="data()!.page <= 1" (click)="setPage(data()!.page - 1)">Prev</button>
        <button class="btn-secondary" [disabled]="data()!.page >= data()!.pages" (click)="setPage(data()!.page + 1)">Next</button>
      </div>
    </div>
  `,
})
export class OrganizationsComponent implements OnInit {
  private svc = inject(OrganizationService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  protected readonly auth = inject(AuthService);
  protected readonly fileUrl = fileUrl;

  data = signal<Paginated<Organization> | null>(null);
  loading = signal(false);
  search = signal('');
  page = signal(1);
  showForm = signal(false);
  creating = signal(false);
  file: File | null = null;
  private search$ = new Subject<string>();

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    category: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit() {
    this.search$
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((s) => {
        this.search.set(s);
        this.page.set(1);
        this.load();
      });
    this.load();
  }

  onSearch(v: string) { this.search$.next(v); }

  setPage(p: number) {
    this.page.set(p);
    this.load();
  }

  load() {
    this.loading.set(true);
    this.svc.list({ page: this.page(), limit: 9, search: this.search() }).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    this.file = input.files?.[0] ?? null;
  }

  create() {
    if (this.form.invalid) return;
    this.creating.set(true);
    const fd = new FormData();
    Object.entries(this.form.getRawValue()).forEach(([k, v]) =>
      fd.append(k, String(v)),
    );
    if (this.file) fd.append('logo', this.file);
    this.svc.create(fd).subscribe({
      next: () => {
        this.toast.success('Organization created');
        this.form.reset();
        this.file = null;
        this.showForm.set(false);
        this.load();
      },
      complete: () => this.creating.set(false),
      error: () => this.creating.set(false),
    });
  }
}
