import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminDashboardComponent } from './dashboard.component';
import { AdminAuthService } from '../../services/auth.service';
import { ProductService, Product } from '../../services/product.service';
import { OrderService, Order } from '../../services/order.service';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let authServiceMock: jasmine.SpyObj<AdminAuthService>;
  let productServiceMock: jasmine.SpyObj<ProductService>;
  let orderServiceMock: jasmine.SpyObj<OrderService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create spy objects for services
    authServiceMock = jasmine.createSpyObj('AdminAuthService', ['getAdminProfile', 'logout']);
    productServiceMock = jasmine.createSpyObj('ProductService', ['getProducts']);
    orderServiceMock = jasmine.createSpyObj('OrderService', ['getOrders']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    // Configure default behavior for mocks
    authServiceMock.getAdminProfile.and.returnValue(of({
      _id: '1',
      username: 'admin',
      email: 'admin@example.com',
      lastLogin: new Date().toISOString()
    }));
    
    productServiceMock.getProducts.and.returnValue(of([
      {
        _id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        images: ['img1.jpg'],
        category: 'Books',
        stock: 10,
        isAvailable: true
      },
      {
        _id: '2',
        name: 'Product 2',
        description: 'Description 2',
        price: 150,
        images: ['img2.jpg'],
        category: 'Books',
        stock: 3,
        isAvailable: true
      },
      {
        _id: '3',
        name: 'Product 3',
        description: 'Description 3',
        price: 200,
        images: ['img3.jpg'],
        category: 'Books',
        stock: 2,
        isAvailable: true
      }
    ] as Product[]));
    
    orderServiceMock.getOrders.and.returnValue(of([
      {
        _id: '1',
        customer: { name: 'Customer 1', email: 'customer1@example.com' },
        items: [{ product: '1', quantity: 1, price: 100 }],
        isCustomOrder: false,
        total: 100,
        status: 'completed',
        paymentMethod: 'credit_card',
        paymentStatus: 'completed',
        createdAt: new Date(2023, 5, 1).toISOString()
      },
      {
        _id: '2',
        customer: { name: 'Customer 2', email: 'customer2@example.com' },
        items: [{ product: '2', quantity: 1, price: 150 }],
        isCustomOrder: false,
        total: 150,
        status: 'pending',
        paymentMethod: 'paypal',
        paymentStatus: 'pending',
        createdAt: new Date(2023, 5, 2).toISOString()
      },
      {
        _id: '3',
        customer: { name: 'Customer 3', email: 'customer3@example.com' },
        items: [{ product: '3', quantity: 1, price: 200 }],
        isCustomOrder: false,
        total: 200,
        status: 'processing',
        paymentMethod: 'credit_card',
        paymentStatus: 'completed',
        createdAt: new Date(2023, 5, 3).toISOString()
      }
    ] as Order[]));

    await TestBed.configureTestingModule({
      declarations: [ AdminDashboardComponent ],
      providers: [
        { provide: AdminAuthService, useValue: authServiceMock },
        { provide: ProductService, useValue: productServiceMock },
        { provide: OrderService, useValue: orderServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load admin profile on init', () => {
    expect(authServiceMock.getAdminProfile).toHaveBeenCalled();
    expect(component.adminProfile).toEqual({
      _id: '1',
      username: 'admin',
      email: 'admin@example.com',
      lastLogin: jasmine.any(String)
    });
  });

  it('should redirect to login when profile loading fails with 401', () => {
    // Reset the spy to return an error
    authServiceMock.getAdminProfile.and.returnValue(throwError({ status: 401 }));
    
    // Call the method directly
    component.loadAdminProfile();
    
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/login']);
  });

  it('should load dashboard data on init', () => {
    expect(productServiceMock.getProducts).toHaveBeenCalled();
    expect(orderServiceMock.getOrders).toHaveBeenCalled();
    
    // Check that the stats have been updated
    expect(component.stats.totalProducts).toBe(3);
    expect(component.stats.totalOrders).toBe(3);
    expect(component.stats.pendingOrders).toBe(2); // pending + processing
    expect(component.stats.lowStockProducts.length).toBe(2); // products with stock < 5
    expect(component.stats.recentOrders.length).toBe(3);
    expect(component.isLoading).toBe(false);
  });

  it('should handle product loading error', () => {
    // Spy on console.error
    spyOn(console, 'error');
    
    // Reset the product service spy to return an error
    productServiceMock.getProducts.and.returnValue(throwError('Product error'));
    
    // Call the method directly
    component.loadDashboardData();
    
    expect(console.error).toHaveBeenCalledWith('Error loading products:', 'Product error');
  });

  it('should handle order loading error', () => {
    // Spy on console.error
    spyOn(console, 'error');
    
    // Reset the order service spy to return an error
    orderServiceMock.getOrders.and.returnValue(throwError('Order error'));
    
    // Call the method directly
    component.loadDashboardData();
    
    expect(console.error).toHaveBeenCalledWith('Error loading orders:', 'Order error');
    expect(component.isLoading).toBe(false);
  });

  it('should logout and redirect to login page', () => {
    component.logout();
    
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/login']);
  });
}); 