import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { Paginated, User } from '../../core/models';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="text-2xl font-bold text-slate-900 mb-2">All users</h1>
    <p class="text-sm text-slate-500 mb-6">Admin view of all registered users.</p>

    <div class="card p-4 mb-4">
      <input class="input" placeholder="Search by name, email, student ID…" [ngModel]="search()" (ngModelChange)="onSearch($event)" />
    </div>

    <div class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
          <tr>
            <th class="text-left px-4 py-3">Name</th>
            <th class="text-left px-4 py-3">Email</th>
            <th class="text-left px-4 py-3">Student ID</th>
            <th class="text-left px-4 py-3">Course</th>
            <th class="text-left px-4 py-3">Role</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr *ngFor="let u of data()?.items" class="hover:bg-slate-50">
            <td class="px-4 py-3 font-semibold text-slate-900">{{ u.name }}</td>
            <td class="px-4 py-3 text-slate-600">{{ u.email }}</td>
            <td class="px-4 py-3">{{ u.studentId || '—' }}</td>
            <td class="px-4 py-3">{{ u.course || '—' }}</td>
            <td class="px-4 py-3">
              <span class="badge"
                    [class.bg-brand-100]="u.role==='admin'" [class.text-brand-700]="u.role==='admin'"
                    [class.bg-slate-100]="u.role==='student'" [class.text-slate-700]="u.role==='student'">
                {{ u.role }}
              </span>
            </td>
          </tr>
          <tr *ngIf="data() && data()!.items.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-slate-500">No users found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div *ngIf="data()" class="flex items-center justify-between mt-6 text-sm">
      <span class="text-slate-500">Page {{ data()!.page }} of {{ data()!.pages || 1 }} ({{ data()!.total }} users)</span>
      <div class="flex gap-2">
        <button class="btn-secondary" [disabled]="data()!.page <= 1" (click)="setPage(data()!.page - 1)">Prev</button>
        <button class="btn-secondary" [disabled]="data()!.page >= data()!.pages" (click)="setPage(data()!.page + 1)">Next</button>
      </div>
    </div>
  `,
})
export class MembersComponent implements OnInit {
  private svc = inject(UserService);
  data = signal<Paginated<User> | null>(null);
  search = signal('');
  page = signal(1);
  private search$ = new Subject<string>();

  ngOnInit() {
    this.search$
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((s) => { this.search.set(s); this.page.set(1); this.load(); });
    this.load();
  }

  onSearch(v: string) { this.search$.next(v); }
  setPage(p: number) { this.page.set(p); this.load(); }

  load() {
    this.svc.list({ page: this.page(), limit: 15, search: this.search() }).subscribe({
      next: (res) => this.data.set(res),
    });
  }
}
