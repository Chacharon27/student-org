import { ChangeDetectionStrategy, Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrganizationService } from '../../core/services/organization.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Member, Organization } from '../../core/models';
import { fileUrl } from '../../core/services/file-url';

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/organizations" class="text-sm text-brand-700 hover:underline">← Back to organizations</a>

    <div *ngIf="loading()" class="mt-6 text-sm text-slate-500">Loading…</div>

    <ng-container *ngIf="org() as o">
      <div class="card overflow-hidden mt-4">
        <div class="h-32 bg-gradient-to-br from-brand-700 to-brand-400"></div>
        <div class="p-6 -mt-12 flex flex-col sm:flex-row gap-5">
          <img *ngIf="o.logoUrl; else fb" [src]="fileUrl(o.logoUrl)" class="w-24 h-24 rounded-xl object-cover ring-4 ring-white bg-white" alt="" />
          <ng-template #fb>
            <div class="w-24 h-24 rounded-xl bg-brand-100 text-brand-700 grid place-items-center font-extrabold text-3xl ring-4 ring-white">
              {{ o.name[0] }}
            </div>
          </ng-template>
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-slate-900">{{ o.name }}</h1>
            <p class="text-sm text-brand-700 font-medium">{{ o.category }}</p>
            <p class="mt-3 text-slate-600">{{ o.description }}</p>
          </div>
          <div class="flex flex-col gap-2 items-end">
            <button *ngIf="auth.user && auth.user.role === 'student'" class="btn-primary" [disabled]="joining" (click)="join(o._id)">
              {{ joining ? 'Joining…' : 'Request to join' }}
            </button>
            <button *ngIf="auth.user?.role === 'admin'" class="btn-danger" (click)="remove(o._id)">Delete</button>
          </div>
        </div>
      </div>

      <div class="card p-6 mt-6">
        <h2 class="font-bold text-slate-900 mb-4">Members ({{ members().length }})</h2>
        <div *ngIf="members().length === 0" class="text-sm text-slate-500">No members yet.</div>
        <ul class="grid sm:grid-cols-2 gap-3">
          <li *ngFor="let m of members()" class="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
            <div class="w-10 h-10 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-semibold">
              {{ m.user.name[0] }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-slate-900 truncate">{{ m.user.name }}</p>
              <p class="text-xs text-slate-500">{{ m.position }}</p>
            </div>
            <span class="badge"
                  [class.bg-green-100]="m.status==='active'" [class.text-green-700]="m.status==='active'"
                  [class.bg-amber-100]="m.status==='pending'" [class.text-amber-700]="m.status==='pending'"
                  [class.bg-slate-100]="m.status==='inactive'" [class.text-slate-600]="m.status==='inactive'">
              {{ m.status }}
            </span>
            <ng-container *ngIf="auth.user?.role === 'admin'">
              <button *ngIf="m.status==='pending'" class="text-xs text-brand-700 hover:underline" (click)="approve(o._id, m)">Approve</button>
              <button class="text-xs text-red-600 hover:underline" (click)="kick(o._id, m._id)">Remove</button>
            </ng-container>
          </li>
        </ul>
      </div>
    </ng-container>
  `,
})
export class OrganizationDetailComponent implements OnInit {
  @Input({ required: true }) id!: string;
  private svc = inject(OrganizationService);
  private toast = inject(ToastService);
  private router = inject(Router);
  protected readonly auth = inject(AuthService);
  protected readonly fileUrl = fileUrl;

  org = signal<Organization | null>(null);
  members = signal<Member[]>([]);
  loading = signal(true);
  joining = false;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.get(this.id).subscribe({
      next: (o) => { this.org.set(o); this.loading.set(false); },
    });
    this.svc.members(this.id).subscribe({ next: (r) => this.members.set(r.items) });
  }

  join(orgId: string) {
    this.joining = true;
    this.svc.join(orgId).subscribe({
      next: () => { this.toast.success('Membership requested!'); this.load(); },
      complete: () => (this.joining = false),
      error: () => (this.joining = false),
    });
  }

  approve(orgId: string, m: Member) {
    this.svc.updateMember(orgId, m._id, { status: 'active' }).subscribe(() => {
      this.toast.success('Member approved');
      this.load();
    });
  }

  kick(orgId: string, memberId: string) {
    if (!confirm('Remove this member?')) return;
    this.svc.removeMember(orgId, memberId).subscribe(() => {
      this.toast.success('Member removed');
      this.load();
    });
  }

  remove(id: string) {
    if (!confirm('Delete this organization?')) return;
    this.svc.delete(id).subscribe(() => {
      this.toast.success('Deleted');
      this.router.navigateByUrl('/organizations');
    });
  }
}
