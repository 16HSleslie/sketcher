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

    // Test S3 image URLs
    this.testS3ImageUrls();
  }

  /**
   * Test S3 image URLs directly to debug access issues
   */
  private testS3ImageUrls(): void {
    const testUrls = [
      // These direct URLs are expected to fail with 403, which confirms our understanding
      'https://bookstore-images-420.s3.ap-southeast-2.amazonaws.com/banner/homepage-banner.png',
      'https://bookstore-images-420.s3.ap-southeast-2.amazonaws.com/banner/logo.png'
    ];

    testUrls.forEach(url => {
      fetch(url, { method: 'HEAD' })
        .then(response => {
          console.log(`S3 URL test (${url}): ${response.ok ? 'SUCCESS' : 'FAILED'} - Status: ${response.status}`);
        })
        .catch(error => {
          console.log(`S3 URL test (${url}): ERROR - ${error.message}`);
        });
    });
    
    // Test the API endpoint for signed URLs - this should succeed
    const token = localStorage.getItem('admin_token') || '';
    if (token) {
      fetch('/api/uploads/signed/banner/logo.png', {
        headers: {
          'x-auth-token': token
        }
      })
      .then(response => response.json())
      .then(data => {
        console.log('Signed URL test result:', data);
      })
      .catch(error => {
        console.error('Signed URL test error:', error);
      });
    } else {
      console.log('No auth token available for signed URL test');
    }
  }
} 