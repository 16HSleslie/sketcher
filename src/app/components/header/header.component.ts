import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { AssetService } from '../../services/asset.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  scrolled = false;
  mobileMenuOpen = false;
  logoUrl: string;
  private subscription: Subscription;

  constructor(private assetService: AssetService) {
    this.logoUrl = this.assetService.getLogoUrl(); // Initial value
    
    this.subscription = this.assetService.logoUrl$.subscribe(url => {
      console.log('Logo URL updated:', url);
      this.logoUrl = url;
    });
  }

  ngOnInit(): void {
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Handle image loading errors by using a text-based logo instead
   */
  handleImageError(type: string): void {
    // If already using local asset, don't log an error
    if (this.logoUrl.startsWith('assets/')) {
      return;
    }
    
    console.error(`Error loading ${type} image:`, this.logoUrl);
    
    // Use the local asset
    this.assetService.setLogoUrl(this.assetService.getLogoUrl());
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 50;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
} 