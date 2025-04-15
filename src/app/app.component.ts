import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
    <app-header *ngIf="!isAdminRoute"></app-header>
    <div [ngClass]="{'content-wrapper': !isAdminRoute}">
      <router-outlet></router-outlet>
    </div>
    <app-footer *ngIf="!isAdminRoute"></app-footer>
  `,
  styles: [`
    .content-wrapper {
      min-height: calc(100vh - 200px);
      margin-top: 80px;
    }
  `]
})
export class AppComponent {
  title = 'Lily\'s Bookbinding';
  isAdminRoute = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminRoute = event.url.includes('/admin');
    });
  }
} 