import { Component, OnInit } from '@angular/core';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  isLoading: boolean = true;
  selectedOrder: Order | null = null;
  
  // Filters
  statusFilter: string = 'all';
  searchTerm: string = '';
  
  constructor(private orderService: OrderService) {}
  
  ngOnInit(): void {
    this.loadOrders();
  }
  
  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
      }
    });
  }
  
  applyFilters(): void {
    let filtered = [...this.orders];
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }
    
    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(order => 
        order.customer.name.toLowerCase().includes(term) ||
        order.customer.email.toLowerCase().includes(term) ||
        (order._id && order._id.toLowerCase().includes(term))
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    
    this.filteredOrders = filtered;
  }
  
  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }
  
  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }
  
  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }
  
  closeOrderDetails(): void {
    this.selectedOrder = null;
  }
  
  updateOrderStatus(orderId: string, status: Order['status']): void {
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: (updatedOrder) => {
        // Update order in the lists
        const index = this.orders.findIndex(o => o._id === orderId);
        if (index !== -1) {
          this.orders[index] = {...this.orders[index], ...updatedOrder};
        }
        
        if (this.selectedOrder && this.selectedOrder._id === orderId) {
          this.selectedOrder = {...this.selectedOrder, ...updatedOrder};
        }
        
        this.applyFilters();
      },
      error: (error) => console.error('Error updating order status:', error)
    });
  }
  
  addTrackingNumber(orderId: string, trackingNumber: string): void {
    if (!trackingNumber.trim()) return;
    
    this.orderService.addTrackingNumber(orderId, trackingNumber).subscribe({
      next: (updatedOrder) => {
        // Update order in the lists
        const index = this.orders.findIndex(o => o._id === orderId);
        if (index !== -1) {
          this.orders[index] = {...this.orders[index], ...updatedOrder};
        }
        
        if (this.selectedOrder && this.selectedOrder._id === orderId) {
          this.selectedOrder = {...this.selectedOrder, ...updatedOrder};
        }
      },
      error: (error) => console.error('Error adding tracking number:', error)
    });
  }
} 