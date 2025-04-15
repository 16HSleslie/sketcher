import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = true;
  error: string | null = null;
  selectedCategory: string | null = null;
  categories: string[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data.filter(product => product.isAvailable);
        this.extractCategories();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
        console.error('Error loading products:', err);
      }
    });
  }

  extractCategories(): void {
    const categorySet = new Set<string>();
    this.products.forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    this.categories = Array.from(categorySet);
  }

  filterByCategory(category: string | null): void {
    this.selectedCategory = category;
  }

  addToCart(product: Product): void {
    // For now, just log to console - in a real app, this would connect to a cart service
    console.log(`Added to cart: ${product.name}`);
    
    // Show a simple notification
    alert(`${product.name} has been added to your cart!`);
    
    // TODO: Connect to a cart service
  }

  get filteredProducts(): Product[] {
    if (!this.selectedCategory) {
      return this.products;
    }
    return this.products.filter(product => product.category === this.selectedCategory);
  }
} 