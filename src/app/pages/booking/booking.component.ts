import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService, Property } from '../../services/api.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Create Booking</h1>
        <p class="subtitle">Fill in your details to reserve your room</p>
      </div>

      <div class="card booking-form">
        <!-- Success state -->
        <div *ngIf="success" class="alert alert-success">
          <div class="success-icon">🎉</div>
          <strong>Booking Confirmed!</strong>
          <p>Booking #{{ createdBookingId }} has been created. A notification will appear within ~10 seconds.</p>
          <div class="success-actions">
            <button class="btn btn-primary" (click)="router.navigate(['/my-bookings'])">View My Bookings</button>
            <button class="btn btn-secondary" (click)="router.navigate(['/notifications'])">View Notifications</button>
          </div>
        </div>

        <form *ngIf="!success" (ngSubmit)="submit()" #bookingForm="ngForm">
          <div class="form-grid">
            <div class="field-group">
              <label>Room</label>
              <select [(ngModel)]="form.roomId" name="roomId" class="input" (change)="recalculate()" required>
                <option [ngValue]="0" disabled>Select a room...</option>
                <ng-container *ngFor="let prop of properties">
                  <optgroup [label]="prop.name + ' — ' + prop.city">
                    <option *ngFor="let room of prop.rooms" [ngValue]="room.id">
                      {{ room.name }} (SAR {{ room.pricePerNight | number }}/night)
                    </option>
                  </optgroup>
                </ng-container>
              </select>
            </div>

            <div class="field-group">
              <label>Guest Name</label>
              <input type="text" [(ngModel)]="form.guestName" name="guestName"
                     class="input" placeholder="Enter full name" required />
            </div>

            <div class="field-group">
              <label>Check-in Date</label>
              <input type="date" [(ngModel)]="form.checkIn" name="checkIn"
                     class="input" [min]="today" required (change)="recalculate()" />
            </div>

            <div class="field-group">
              <label>Check-out Date</label>
              <input type="date" [(ngModel)]="form.checkOut" name="checkOut"
                     class="input" [min]="form.checkIn || today" required (change)="recalculate()" />
            </div>
          </div>

          <!-- Total amount preview -->
          <div *ngIf="totalAmount > 0" class="amount-preview">
            <div class="amount-label">Total Amount</div>
            <div class="amount-value">SAR {{ totalAmount | number:'1.2-2' }}</div>
            <div class="amount-detail">{{ nights }} night(s) × SAR {{ pricePerNight | number }}</div>
          </div>

          <!-- Error message from API — shown in red exactly as returned -->
          <div *ngIf="errorMsg" class="alert alert-error">
            <strong>⚠️ Booking Failed</strong>
            <p>{{ errorMsg }}</p>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="router.navigate(['/rooms'])">
              ← Back to Rooms
            </button>
            <button type="submit" class="btn btn-primary btn-large"
                    [disabled]="submitting || !bookingForm.valid || !form.roomId">
              {{ submitting ? 'Creating Booking...' : '✅ Confirm Booking' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class BookingComponent implements OnInit {
  properties: Property[] = [];
  form = { roomId: 0, guestName: '', checkIn: '', checkOut: '' };
  submitting = false;
  success = false;
  errorMsg = '';
  createdBookingId: number | null = null;
  today = new Date().toISOString().split('T')[0];
  totalAmount = 0;
  nights = 0;
  pricePerNight = 0;

  constructor(
    private api: ApiService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.api.getProperties().subscribe(data => {
      this.properties = data;
      // Pre-fill from query params (when coming from rooms page)
      this.route.queryParams.subscribe(params => {
        if (params['roomId']) this.form.roomId = +params['roomId'];
        if (params['checkIn']) this.form.checkIn = params['checkIn'];
        if (params['checkOut']) this.form.checkOut = params['checkOut'];
        this.recalculate();
      });
    });
  }

  recalculate() {
    if (!this.form.checkIn || !this.form.checkOut || !this.form.roomId) {
      this.totalAmount = 0; return;
    }
    const allRooms = this.properties.flatMap(p => p.rooms);
    const room = allRooms.find(r => r.id === +this.form.roomId);
    if (!room) return;
    this.pricePerNight = room.pricePerNight;
    const diff = (new Date(this.form.checkOut).getTime() - new Date(this.form.checkIn).getTime()) / 86400000;
    this.nights = Math.max(0, Math.round(diff));
    this.totalAmount = this.pricePerNight * this.nights;
  }

  submit() {
    if (!this.form.roomId) {
      this.errorMsg = 'Please select a room.';
      return;
    }
    this.submitting = true;
    this.errorMsg = '';
    const req = {
      roomId: +this.form.roomId,
      guestName: this.form.guestName,
      checkIn: this.form.checkIn,
      checkOut: this.form.checkOut
    };
    this.api.createBooking(req).subscribe({
      next: booking => {
        this.createdBookingId = booking.id;
        this.success = true;
        this.submitting = false;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMsg = err.error?.error || err.error?.message || err.message || 'An unexpected error occurred.';
        this.submitting = false;
      }
    });
  }
}
