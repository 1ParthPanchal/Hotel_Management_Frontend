import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
    return this.http.get<any[]>(`${GATEWAY}/api/catalog/properties`).pipe(
      map(list => (list || []).map(p => ({
        id: p.id ?? p.Id,
        name: p.name ?? p.Name,
        city: p.city ?? p.City,
        rooms: (p.rooms ?? p.Rooms ?? []).map((r: any) => ({
          id: r.id ?? r.Id,
          propertyId: r.propertyId ?? r.PropertyId,
          name: r.name ?? r.Name,
          pricePerNight: r.pricePerNight ?? r.PricePerNight,
          capacity: r.capacity ?? r.Capacity
        }))
      })))
    );
  }

  // ── Bookings ───────────────────────────────────────────────────────────────

  checkAvailability(roomId: number, checkIn: string, checkOut: string): Observable<AvailabilityResponse> {
    const params = new HttpParams()
      .set('roomId', roomId)
      .set('checkIn', checkIn)
      .set('checkOut', checkOut);
    return this.http.get<any>(`${GATEWAY}/api/bookings/availability`, { params }).pipe(
      map(res => ({
        roomId: res.roomId ?? res.RoomId,
        checkIn: res.checkIn ?? res.CheckIn,
        checkOut: res.checkOut ?? res.CheckOut,
        available: res.available ?? res.Available ?? false
      }))
    );
  }

  createBooking(req: CreateBookingRequest): Observable<Booking> {
    return this.http.post<any>(`${GATEWAY}/api/bookings`, req).pipe(
      map(b => ({
        id: b.id ?? b.Id,
        roomId: b.roomId ?? b.RoomId,
        guestName: b.guestName ?? b.GuestName,
        checkIn: b.checkIn ?? b.CheckIn,
        checkOut: b.checkOut ?? b.CheckOut,
        totalAmount: b.totalAmount ?? b.TotalAmount,
        status: b.status ?? b.Status,
        createdAt: b.createdAt ?? b.CreatedAt
      }))
    );
  }

  getBookings(): Observable<Booking[]> {
    return this.http.get<any[]>(`${GATEWAY}/api/bookings`).pipe(
      map(list => (list || []).map(b => ({
        id: b.id ?? b.Id,
        roomId: b.roomId ?? b.RoomId,
        guestName: b.guestName ?? b.GuestName,
        checkIn: b.checkIn ?? b.CheckIn,
        checkOut: b.checkOut ?? b.CheckOut,
        totalAmount: b.totalAmount ?? b.TotalAmount,
        status: b.status ?? b.Status,
        createdAt: b.createdAt ?? b.CreatedAt
      })))
    );
  }

  cancelBooking(id: number): Observable<Booking> {
    return this.http.post<any>(`${GATEWAY}/api/bookings/${id}/cancel`, {}).pipe(
      map(b => ({
        id: b.id ?? b.Id,
        roomId: b.roomId ?? b.RoomId,
        guestName: b.guestName ?? b.GuestName,
        checkIn: b.checkIn ?? b.CheckIn,
        checkOut: b.checkOut ?? b.CheckOut,
        totalAmount: b.totalAmount ?? b.TotalAmount,
        status: b.status ?? b.Status,
        createdAt: b.createdAt ?? b.CreatedAt
      }))
    );
  }

  // ── Notifications ──────────────────────────────────────────────────────────

  getNotifications(): Observable<Notification[]> {
    return this.http.get<any[]>(`${GATEWAY}/api/notifications`).pipe(
      map(list => (list || []).map(n => ({
        id: n.id ?? n.Id,
        bookingId: n.bookingId ?? n.BookingId,
        type: n.type ?? n.Type,
        message: n.message ?? n.Message,
        createdAt: n.createdAt ?? n.CreatedAt
      })))
    );
  }
}
