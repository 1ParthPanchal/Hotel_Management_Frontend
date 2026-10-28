import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="header-inner">
        <div class="logo">
          <span class="logo-icon">🏨</span>
          <span class="logo-text">LocalStay</span>
        </div>
        <nav class="nav">
          <a routerLink="/rooms" routerLinkActive="active" class="nav-link">🔍 Search Rooms</a>
          <a routerLink="/booking" routerLinkActive="active" class="nav-link">📝 Book Now</a>
          <a routerLink="/my-bookings" routerLinkActive="active" class="nav-link">📋 My Bookings</a>
          <a routerLink="/notifications" routerLinkActive="active" class="nav-link">🔔 Notifications</a>
        </nav>
      </div>
    </header>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AppComponent {}
