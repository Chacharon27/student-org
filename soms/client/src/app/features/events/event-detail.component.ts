import { ChangeDetectionStrategy, Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { EventItem, Organization } from '../../core/models';
import { fileUrl } from '../../core/services/file-url';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/events" class="text-sm text-brand-100 hover:text-white hover:underline">&larr; Back to events</a>

    <div *ngIf="loading()" class="mt-6 text-sm text-slate-300">Loading...</div>

    <ng-container *ngIf="event() as e">
      <div class="card overflow-hidden mt-4">
        <div class="h-56 bg-brand-100">
          <img *ngIf="e.posterUrl" [src]="fileUrl(e.posterUrl)" class="w-full h-full object-cover" alt="" />
        </div>
        <div class="p-6">
          <p class="text-xs uppercase tracking-wider font-bold text-brand-700">{{ org(e)?.name }}</p>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900 mt-1">{{ e.title }}</h1>
          <div class="mt-3 grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p class="text-slate-400 uppercase text-xs">When</p>
              <p class="font-medium">{{ e.startsAt | date:'medium' }}</p>
              <p class="text-slate-500 text-xs">to {{ e.endsAt | date:'shortTime' }}</p>
            </div>
            <div>
              <p class="text-slate-400 uppercase text-xs">Where</p>
              <p class="font-medium">{{ e.location }}</p>
            </div>
            <div>
              <p class="text-slate-400 uppercase text-xs">Capacity</p>
              <p class="font-medium">
                {{ e.registrationCount ?? 0 }}<span *ngIf="e.capacity > 0"> / {{ e.capacity }}</span>
              </p>
            </div>
          </div>
          <p class="mt-6 text-slate-700 whitespace-pre-line">{{ e.description }}</p>
          <div class="mt-6 flex gap-3">
            <button *ngIf="auth.user" class="btn-primary" [disabled]="acting()" (click)="register(e._id)">Register</button>
            <button *ngIf="auth.user" class="btn-secondary" [disabled]="acting()" (click)="cancel(e._id)">Cancel registration</button>
            <button *ngIf="auth.user?.role === 'admin'" class="btn-danger ml-auto" (click)="remove(e._id)">Delete event</button>
          </div>
          <p *ngIf="!auth.user" class="text-sm text-slate-500 mt-4">
            <a routerLink="/login" class="text-brand-700 font-semibold">Sign in</a> to register.
          </p>
        </div>
      </div>
    </ng-container>
  `,
})
export class EventDetailComponent implements OnInit {
  @Input({ required: true }) id!: string;
  private svc = inject(EventService);
  private toast = inject(ToastService);
  private router = inject(Router);
  protected readonly auth = inject(AuthService);
  protected readonly fileUrl = fileUrl;

  event = signal<EventItem | null>(null);
  loading = signal(true);
  acting = signal(false);

  ngOnInit() { this.load(); }

  org(e: EventItem): Organization | null {
    return typeof e.organization === 'string' ? null : e.organization;
  }

  load() {
    this.loading.set(true);
    this.svc.get(this.id).subscribe({
      next: (e) => { this.event.set(e); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  register(eid: string) {
    this.acting.set(true);
    this.svc.registerForEvent(eid).subscribe({
      next: () => { this.toast.success('Registered!'); this.load(); },
      complete: () => this.acting.set(false),
      error: () => this.acting.set(false),
    });
  }

  cancel(eid: string) {
    this.acting.set(true);
    this.svc.cancel(eid).subscribe({
      next: () => { this.toast.success('Registration cancelled'); this.load(); },
      complete: () => this.acting.set(false),
      error: () => this.acting.set(false),
    });
  }

  remove(eid: string) {
    if (!confirm('Delete this event?')) return;
    this.svc.delete(eid).subscribe(() => {
      this.toast.success('Deleted');
      this.router.navigateByUrl('/events');
    });
  }
}
