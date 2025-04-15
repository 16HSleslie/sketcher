import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private apiUrl = '/api/uploads/signed';
  private _logoUrl = new BehaviorSubject<string>('');
  private _bannerUrl = new BehaviorSubject<string>('');
  
  public logoUrl$ = this._logoUrl.asObservable();
  public bannerUrl$ = this._bannerUrl.asObservable();
  
  constructor(private http: HttpClient) {
    console.log('Asset Service initializing...');
    this.loadAssetsViaSignedUrls();
  }

  /**
   * Get the current URL for the logo
   */
  getLogoUrl(): string {
    return this._logoUrl.getValue() || 'assets/images/logo.png';
  }

  /**
   * Get the current URL for the homepage banner
   */
  getHomepageBannerUrl(): string {
    return this._bannerUrl.getValue() || 'assets/images/background-banner.png';
  }
  
  /**
   * Set logo URL
   */
  setLogoUrl(url: string): void {
    this._logoUrl.next(url);
  }
  
  /**
   * Set banner URL
   */
  setBannerUrl(url: string): void {
    this._bannerUrl.next(url);
  }

  /**
   * Get signed URLs for assets using backend API
   */
  private loadAssetsViaSignedUrls(): void {
    // Get token - if no token, don't even try the API calls
    const token = localStorage.getItem('admin_token');
    if (!token) {
      console.log('No auth token available - using fallback images');
      this.setLogoUrl(this.getLogoUrl());
      this.setBannerUrl(this.getHomepageBannerUrl());
      return;
    }

    // Try loading logo from signed URL
    this.getSignedUrl('banner/logo.png').subscribe(
      response => {
        console.log('Got signed URL for logo:', response);
        this.setLogoUrl(response.url);
      },
      error => {
        console.error('Failed to get signed URL for logo:', error);
        // Set a fallback image path
        this.setLogoUrl(this.getLogoUrl());
      }
    );

    // Try loading banner from signed URL
    this.getSignedUrl('banner/homepage-banner.png').subscribe(
      response => {
        console.log('Got signed URL for banner:', response);
        this.setBannerUrl(response.url);
      },
      error => {
        console.error('Failed to get signed URL for banner:', error);
        // Try the alternative spellings
        this.getSignedUrl('banner/background-banner.png').subscribe(
          response => {
            console.log('Got signed URL for background banner:', response);
            this.setBannerUrl(response.url);
          },
          error => {
            console.error('Failed to get signed URL for background banner:', error);
            // Try another spelling variation
            this.getSignedUrl('banner/homepahe-banne.png').subscribe(
              response => {
                console.log('Got signed URL for alternate banner:', response);
                this.setBannerUrl(response.url);
              },
              error => {
                console.error('Failed to get signed URL for alternate banner:', error);
                // Set a fallback image path
                this.setBannerUrl(this.getHomepageBannerUrl());
              }
            );
          }
        );
      }
    );
  }

  /**
   * Get a signed URL for a file from the backend
   */
  private getSignedUrl(key: string) {
    const token = localStorage.getItem('admin_token') || '';
    const headers = new HttpHeaders({
      'x-auth-token': token
    });
    
    return this.http.get<{url: string}>(`${this.apiUrl}/${key}`, { headers });
  }
} 