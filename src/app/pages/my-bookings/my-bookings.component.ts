import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Booking } from '../../services/api.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>My Bookings</h1>
        <p class="subtitle">Manage your reservations</p>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading bookings...</span>
      </div>

      <div *ngIf="error" class="alert alert-error">{{ error }}</div>

      <div *ngIf="!loading && bookings.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No bookings yet</h3>
        <p>Go to <a href="/rooms">Search Rooms</a> to make your first booking.</p>
      </div>

      <div class="bookings-list">
        <div *ngFor="let booking of bookings" class="booking-card card"
             [class.cancelled]="booking.status === 'Cancelled'">
          <div class="booking-header">
            <div class="booking-id">Booking #{{ booking.id }}</div>
            <div class="booking-status" [class.status-confirmed]="booking.status === 'Confirmed'"
                 [class.status-cancelled]="booking.status === 'Cancelled'">
              {{ booking.status === 'Confirmed' ? '✅' : '❌' }} {{ booking.status }}
            </div>
          </div>

          <div class="booking-details">
            <div class="detail-item">
              <span class="detail-label">👤 Guest</span>
              <span class="detail-value">{{ booking.guestName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">🛏️ Room ID</span>
              <span class="detail-value">{{ booking.roomId }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">📅 Check-in</span>
              <span class="detail-value">{{ booking.checkIn | date:'mediumDate' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">📅 Check-out</span>
              <span class="detail-value">{{ booking.checkOut | date:'mediumDate' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">💰 Total</span>
              <span class="detail-value price">SAR {{ booking.totalAmount | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="booking-actions" *ngIf="booking.status === 'Confirmed'">
            <button class="btn btn-danger"
                    [disabled]="cancelling[booking.id]"
                    (click)="cancel(booking.id)">
              {{ cancelling[booking.id] ? 'Cancelling...' : '🚫 Cancel Booking' }}
            </button>
          </div>

          <div *ngIf="cancelSuccess[booking.id]" class="alert alert-success small">
            Booking cancelled successfully.
          </div>
          <div *ngIf="cancelError[booking.id]" class="alert alert-error small">
            {{ cancelError[booking.id] }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  loading = false;
  error = '';
  cancelling: Record<number, boolean> = {};
  cancelSuccess: Record<number, boolean> = {};
  cancelError: Record<number, string> = {};

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getBookings().subscribe({
      next: data => { this.bookings = data; this.loading = false; },
      error: () => { this.error = 'Could not load bookings.'; this.loading = false; }
    });
  }

  cancel(id: number) {
    this.cancelling[id] = true;
    this.cancelSuccess[id] = false;
    this.cancelError[id] = '';
    this.api.cancelBooking(id).subscribe({
      next: updated => {
        const idx = this.bookings.findIndex(b => b.id === id);
        if (idx !== -1) this.bookings[idx] = updated;
        this.cancelling[id] = false;
        this.cancelSuccess[id] = true;
      },
      error: err => {
        this.cancelling[id] = false;
        this.cancelError[id] = err.error?.message || 'Failed to cancel booking.';
      }
    });
  }
}
