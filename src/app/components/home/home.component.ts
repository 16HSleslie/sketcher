import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssetService } from '../../services/asset.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  bannerUrl: string;
  bannerError = false;
  private subscription: Subscription;
  
  constructor(private assetService: AssetService) {
    this.bannerUrl = this.assetService.getHomepageBannerUrl(); // Initial value
    
    this.subscription = this.assetService.bannerUrl$.subscribe(url => {
      console.log('Banner URL updated:', url);
      this.bannerUrl = url;
      
      // Check if banner loads
      this.checkImageLoads(url);
    });
  }

  ngOnInit(): void {
  }
  
  /**
   * Check if an image loads successfully
   */
  private checkImageLoads(url: string): void {
    // If it's a local asset path, don't need to test loading
    if (url.startsWith('assets/')) {
      console.log('Using local asset for banner:', url);
      this.bannerError = false;
      return;
    }

    const img = new Image();
    img.onload = () => {
      console.log('Banner image loaded successfully');
      this.bannerError = false;
    };
    img.onerror = () => {
      console.error('Banner image failed to load:', url);
      this.bannerError = true;
    };
    img.src = url;
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
} 