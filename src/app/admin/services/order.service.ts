import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

export interface CustomOrderDetails {
  specifications: string;
  requiredMaterials?: string;
  estimatedCompletionTime?: string;
  additionalNotes?: string;
}

export interface Customer {
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface Order {
  _id?: string;
  customer: Customer;
  items: OrderItem[];
  isCustomOrder: boolean;
  customOrderDetails?: CustomOrderDetails;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt?: string;
  updatedAt?: string;
  trackingNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: string, status: Order['status']): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, { status });
  }

  updatePaymentStatus(id: string, paymentStatus: Order['paymentStatus']): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, { paymentStatus });
  }

  addTrackingNumber(id: string, trackingNumber: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, { trackingNumber });
  }

  deleteOrder(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 