import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AdminDashboardComponent } from './dashboard.component';
import { AdminAuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AdminDashboardComponent Snapshots', () => {
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
      lastLogin: new Date('2023-01-01').toISOString() // Fixed date for stable snapshots
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
      }
    ]));
    
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
        createdAt: new Date('2023-01-01').toISOString() // Fixed date for stable snapshots
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
        createdAt: new Date('2023-01-02').toISOString() // Fixed date for stable snapshots
      }
    ]));

    await TestBed.configureTestingModule({
      declarations: [ AdminDashboardComponent ],
      providers: [
        { provide: AdminAuthService, useValue: authServiceMock },
        { provide: ProductService, useValue: productServiceMock },
        { provide: OrderService, useValue: orderServiceMock },
        { provide: Router, useValue: routerMock }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unknown elements for snapshot testing
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should match snapshot for dashboard component', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should match snapshot for dashboard with low stock warning', () => {
    // Set a product to low stock to trigger warning display
    component.stats.lowStockProducts = [
      {
        _id: '2',
        name: 'Product 2',
        description: 'Description 2',
        price: 150,
        images: ['img2.jpg'],
        category: 'Books',
        stock: 1, // Very low stock
        isAvailable: true
      }
    ];
    
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should match snapshot for dashboard with pending orders', () => {
    // Set pending orders
    component.stats.pendingOrders = 5;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should match snapshot for loading state', () => {
    component.isLoading = true;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
}); 