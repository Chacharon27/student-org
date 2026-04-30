import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OrganizationService } from '../../core/services/organization.service';
import { EventService } from '../../core/services/event.service';
import { AnnouncementService } from '../../core/services/announcement.service';
import { AuthService } from '../../core/services/auth.service';
import { Announcement, EventItem, Organization } from '../../core/models';
import { fileUrl } from '../../core/services/file-url';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-[32px] bg-gradient-to-br from-brand-700 via-brand-600 to-accent-400 text-white p-8 md:p-12 shadow-soft mb-8">
      <p class="text-brand-100 text-sm font-medium uppercase tracking-wider">
        {{ auth.user ? 'Welcome back, ' + auth.user.name : 'Welcome' }}
      </p>
      <h1 class="text-3xl md:text-4xl font-extrabold mt-2">
        Your campus, your community.
      </h1>
      <p class="mt-3 text-brand-100 max-w-xl">
        Manage organizations, discover events, and stay informed with announcements — all in one place.
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <a routerLink="/organizations" class="btn-primary">Browse organizations</a>
        <a routerLink="/events" class="btn-secondary">View events</a>
      </div>
    </section>

    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-900">Upcoming events</h2>
            <a routerLink="/events" class="text-sm font-medium text-brand-700 hover:underline">View all</a>
          </div>
          <div *ngIf="loading()" class="text-sm text-slate-500">Loading…</div>
          <div *ngIf="!loading() && events().length === 0" class="text-sm text-slate-500">
            No upcoming events.
          </div>
          <ul class="divide-y divide-slate-100">
            <li *ngFor="let e of events()" class="py-3 flex gap-4 items-start">
              <div class="w-14 h-14 rounded-lg bg-brand-100 text-brand-700 grid place-items-center shrink-0 overflow-hidden">
                <img *ngIf="e.posterUrl; else dateTpl" [src]="fileUrl(e.posterUrl)" alt="" class="w-full h-full object-cover" />
                <ng-template #dateTpl>
                  <div class="text-center leading-none">
                    <div class="text-xs">{{ e.startsAt | date:'MMM' }}</div>
                    <div class="text-lg font-bold">{{ e.startsAt | date:'d' }}</div>
                  </div>
                </ng-template>
              </div>
              <div class="flex-1 min-w-0">
                <a [routerLink]="['/events', e._id]" class="font-semibold text-slate-900 hover:text-brand-700 truncate block">{{ e.title }}</a>
                <p class="text-xs text-slate-500">{{ e.startsAt | date:'medium' }} • {{ e.location }}</p>
              </div>
            </li>
          </ul>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-900">Latest announcements</h2>
            <a routerLink="/announcements" class="text-sm font-medium text-brand-700 hover:underline">View all</a>
          </div>
          <div *ngIf="!loading() && announcements().length === 0" class="text-sm text-slate-500">
            No announcements yet.
          </div>
          <ul class="space-y-4">
            <li *ngFor="let a of announcements()" class="border-l-4 border-brand-500 pl-3">
              <div class="flex items-center gap-2">
                <span *ngIf="a.pinned" class="badge bg-amber-100 text-amber-800">Pinned</span>
                <p class="font-semibold text-slate-900">{{ a.title }}</p>
              </div>
              <p class="text-sm text-slate-600 mt-1 line-clamp-2">{{ a.body }}</p>
              <p class="text-xs text-slate-400 mt-1">{{ a.createdAt | date:'medium' }}</p>
            </li>
          </ul>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card p-6">
          <h2 class="text-lg font-bold text-slate-900 mb-4">Featured organizations</h2>
          <ul class="space-y-3">
            <li *ngFor="let o of orgs()">
              <a [routerLink]="['/organizations', o._id]" class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                <img *ngIf="o.logoUrl; else logoFallback" [src]="fileUrl(o.logoUrl)" class="w-10 h-10 rounded-lg object-cover" alt="" />
                <ng-template #logoFallback>
                  <div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 grid place-items-center font-bold">
                    {{ o.name[0] }}
                  </div>
                </ng-template>
                <div class="min-w-0">
                  <p class="font-semibold text-slate-900 truncate">{{ o.name }}</p>
                  <p class="text-xs text-slate-500">{{ o.category }}</p>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private orgsSvc = inject(OrganizationService);
  private eventsSvc = inject(EventService);
  private annsSvc = inject(AnnouncementService);
  protected readonly fileUrl = fileUrl;

  loading = signal(true);
  orgs = signal<Organization[]>([]);
  events = signal<EventItem[]>([]);
  announcements = signal<Announcement[]>([]);

  ngOnInit() {
    forkJoin({
      orgs: this.orgsSvc.list({ page: 1, limit: 5 }),
      events: this.eventsSvc.list({ page: 1, limit: 5 }),
      anns: this.annsSvc.list({ page: 1, limit: 5 }),
    }).subscribe({
      next: ({ orgs, events, anns }) => {
        this.orgs.set(orgs.items);
        this.events.set(events.items);
        this.announcements.set(anns.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
