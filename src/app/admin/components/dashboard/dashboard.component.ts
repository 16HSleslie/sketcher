import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { OrderService, Order } from '../../services/order.service';

interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  recentOrders: Order[];
  lowStockProducts: any[];
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats = {
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    recentOrders: [],
    lowStockProducts: []
  };
  
  isLoading: boolean = true;
  adminProfile: any = null;

  constructor(
    private authService: AdminAuthService,
    private productService: ProductService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAdminProfile();
    this.loadDashboardData();
  }

  loadAdminProfile(): void {
    this.authService.getAdminProfile().subscribe({
      next: (profile) => {
        this.adminProfile = profile;
      },
      error: (error) => {
        console.error('Error loading admin profile:', error);
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/admin/login']);
        }
      }
    });
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load products
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.stats.totalProducts = products.length;
        this.stats.lowStockProducts = products
          .filter(product => product.stock < 5 && product.isAvailable)
          .slice(0, 5);
      },
      error: (error) => console.error('Error loading products:', error)
    });
    
    // Load orders
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.stats.totalOrders = orders.length;
        this.stats.pendingOrders = orders.filter(order => 
          order.status === 'pending' || order.status === 'processing'
        ).length;
        
        // Get 5 most recent orders
        this.stats.recentOrders = orders
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 5);
          
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
} 