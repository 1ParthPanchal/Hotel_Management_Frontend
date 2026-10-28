import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Property, AvailabilityResponse } from '../../services/api.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Search Rooms</h1>
        <p class="subtitle">Find your perfect stay across our premium properties</p>
      </div>

      <div class="search-bar card">
        <div class="search-fields">
          <div class="field-group">
            <label>Check-in Date</label>
            <input type="date" [(ngModel)]="checkIn" class="input" [min]="today" />
          </div>
          <div class="field-group">
            <label>Check-out Date</label>
            <input type="date" [(ngModel)]="checkOut" class="input" [min]="checkIn || today" />
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading properties...</span>
      </div>

      <div *ngIf="error" class="alert alert-error">{{ error }}</div>

      <div *ngFor="let property of properties" class="property-card card">
        <div class="property-header">
          <div class="property-icon">🏨</div>
          <div>
            <h2 class="property-name">{{ property.name }}</h2>
            <div class="property-city">📍 {{ property.city }}</div>
          </div>
        </div>

        <div class="rooms-grid">
          <div *ngFor="let room of property.rooms" class="room-card">
            <div class="room-name">{{ room.name }}</div>
            <div class="room-meta">
              <span class="badge">👥 {{ room.capacity }} guests</span>
            </div>
            <div class="room-price">
              <span class="price-amount">SAR {{ room.pricePerNight | number }}</span>
              <span class="price-label">/night</span>
            </div>

            <!-- Availability result for this room -->
            <div *ngIf="availabilityMap[room.id] !== undefined" class="availability-badge"
                 [class.available]="availabilityMap[room.id]"
                 [class.unavailable]="!availabilityMap[room.id]">
              {{ availabilityMap[room.id] ? '✅ Available' : '❌ Unavailable' }}
            </div>

            <div class="room-actions">
              <button class="btn btn-secondary"
                      [disabled]="!checkIn || !checkOut || checkingAvailability[room.id]"
                      (click)="checkAvailability(room.id)">
                {{ checkingAvailability[room.id] ? 'Checking...' : '🔍 Check Availability' }}
              </button>
              <button class="btn btn-primary"
                      (click)="bookRoom(room.id, room.name, property.name)">
                📝 Book This Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RoomsComponent implements OnInit {
  properties: Property[] = [];
  loading = false;
  error = '';
  checkIn = '';
  checkOut = '';
  today = new Date().toISOString().split('T')[0];
  availabilityMap: Record<number, boolean> = {};
  checkingAvailability: Record<number, boolean> = {};

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.loading = true;
    this.api.getProperties().subscribe({
      next: data => { this.properties = data; this.loading = false; },
      error: () => { this.error = 'Could not load properties. Is the gateway running?'; this.loading = false; }
    });
  }

  checkAvailability(roomId: number) {
    if (!this.checkIn || !this.checkOut) return;
    this.checkingAvailability[roomId] = true;
    this.api.checkAvailability(roomId, this.checkIn, this.checkOut).subscribe({
      next: res => {
        this.availabilityMap[roomId] = res.available;
        this.checkingAvailability[roomId] = false;
      },
      error: () => { this.checkingAvailability[roomId] = false; }
    });
  }

  bookRoom(roomId: number, roomName: string, propertyName: string) {
    // Pass query params to the booking page for pre-fill
    this.router.navigate(['/booking'], { queryParams: { roomId, checkIn: this.checkIn, checkOut: this.checkOut } });
  }
}
