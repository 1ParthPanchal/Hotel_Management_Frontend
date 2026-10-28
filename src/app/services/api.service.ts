import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// All requests go through the API Gateway at port 5000.
// The gateway routes /api/catalog → CatalogService, /api/bookings → BookingService, etc.
const GATEWAY = 'http://localhost:5000';

export interface Property {
  id: number;
  name: string;
  city: string;
  rooms: Room[];
}

export interface Room {
  id: number;
  propertyId: number;
  name: string;
  pricePerNight: number;
  capacity: number;
}

export interface Booking {
  id: number;
  roomId: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  roomId: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
}

export interface Notification {
  id: number;
  bookingId: number;
  type: string;
  message: string;
  createdAt: string;
}

export interface AvailabilityResponse {
  roomId: number;
  checkIn: string;
  checkOut: string;
  available: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // ── Catalog ────────────────────────────────────────────────────────────────

  getProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${GATEWAY}/api/catalog/properties`);
  }

  // ── Bookings ───────────────────────────────────────────────────────────────

  checkAvailability(roomId: number, checkIn: string, checkOut: string): Observable<AvailabilityResponse> {
    const params = new HttpParams()
      .set('roomId', roomId)
      .set('checkIn', checkIn)
      .set('checkOut', checkOut);
    return this.http.get<AvailabilityResponse>(`${GATEWAY}/api/bookings/availability`, { params });
  }

  createBooking(req: CreateBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(`${GATEWAY}/api/bookings`, req);
  }

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${GATEWAY}/api/bookings`);
  }

  cancelBooking(id: number): Observable<Booking> {
    return this.http.post<Booking>(`${GATEWAY}/api/bookings/${id}/cancel`, {});
  }

  // ── Notifications ──────────────────────────────────────────────────────────

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${GATEWAY}/api/notifications`);
  }
}
