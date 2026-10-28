import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Notification } from '../../services/api.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Notifications</h1>
        <p class="subtitle">
          Auto-refreshing every 10 seconds
          <span class="refresh-badge" *ngIf="lastRefreshed">
            · Last updated {{ lastRefreshed | date:'HH:mm:ss' }}
          </span>
          <span class="live-dot"></span>
        </p>
      </div>

      <div *ngIf="loading && notifications.length === 0" class="loading-state">
        <div class="spinner"></div>
        <span>Loading notifications...</span>
      </div>

      <div *ngIf="!loading && notifications.length === 0" class="empty-state">
        <div class="empty-icon">🔔</div>
        <h3>No notifications yet</h3>
        <p>Create a booking and a notification will appear here within ~10 seconds.</p>
      </div>

      <div class="notifications-list">
        <div *ngFor="let n of notifications" class="notification-card card"
             [class.type-created]="n.type === 'BookingCreated'"
             [class.type-cancelled]="n.type === 'BookingCancelled'">
          <div class="notif-header">
            <span class="notif-type-icon">
              {{ n.type === 'BookingCreated' ? '🎉' : '❌' }}
            </span>
            <span class="notif-type">{{ n.type === 'BookingCreated' ? 'Booking Confirmed' : 'Booking Cancelled' }}</span>
            <span class="notif-time">{{ n.createdAt | date:'MMM d, HH:mm:ss' }}</span>
          </div>
          <div class="notif-message">{{ n.message }}</div>
          <div class="notif-meta">Booking #{{ n.bookingId }}</div>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading = false;
  lastRefreshed: Date | null = null;
  private intervalId: any;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
    // Auto-refresh every 10 seconds — no manual refresh needed
    this.intervalId = setInterval(() => this.load(), 10000);
  }

  ngOnDestroy() {
    // Clean up the interval when navigating away
    clearInterval(this.intervalId);
  }

  load() {
    this.loading = true;
    this.api.getNotifications().subscribe({
      next: data => {
        this.notifications = data;
        this.lastRefreshed = new Date();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
