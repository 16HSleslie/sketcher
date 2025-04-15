import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading: boolean = true;
  error: string | null = null;
  currentImageIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      if (productId) {
        this.loadProduct(productId);
      } else {
        this.error = 'Product ID not found';
        this.loading = false;
      }
    });
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (data) => {
        this.product = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load product details. Please try again later.';
        this.loading = false;
        console.error('Error loading product:', err);
      }
    });
  }

  goBackToShop(): void {
    this.router.navigate(['/shop']);
  }

  changeImage(index: number): void {
    if (this.product?.images && index >= 0 && index < this.product.images.length) {
      this.currentImageIndex = index;
    }
  }

  get currentImage(): string | null {
    if (this.product?.images && this.product.images.length > 0) {
      return this.product.images[this.currentImageIndex];
    }
    return null;
  }
} 