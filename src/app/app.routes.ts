import { Routes } from '@angular/router';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { BookingComponent } from './pages/booking/booking.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';

export const routes: Routes = [
  { path: '', redirectTo: 'rooms', pathMatch: 'full' },
  { path: 'rooms', component: RoomsComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'my-bookings', component: MyBookingsComponent },
  { path: 'notifications', component: NotificationsComponent },
];
