import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { ShopComponent } from './shop.component';
import { ProductService } from '../../services/product.service';

describe('ShopComponent', () => {
  let component: ShopComponent;
  let fixture: ComponentFixture<ShopComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  const mockProducts = [
    {
      _id: '1',
      name: 'Test Book 1',
      description: 'A test book description',
      price: 25.99,
      images: ['image1.jpg'],
      category: 'Journal',
      stock: 10,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '2',
      name: 'Test Book 2',
      description: 'Another test book description',
      price: 35.99,
      images: ['image2.jpg'],
      category: 'Sketchbook',
      stock: 5,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProductService', ['getProducts']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      declarations: [ShopComponent],
      providers: [
        { provide: ProductService, useValue: spy }
      ]
    }).compileComponents();

    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    productServiceSpy.getProducts.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  it('should load products on init', () => {
    productServiceSpy.getProducts.and.returnValue(of(mockProducts));
    
    fixture.detectChanges();
    
    expect(component.products.length).toEqual(2);
    expect(component.categories.length).toEqual(2);
    expect(component.loading).toEqual(false);
    expect(component.error).toBeNull();
  });

  it('should handle errors when loading products', () => {
    productServiceSpy.getProducts.and.returnValue(throwError(() => new Error('Test error')));
    
    fixture.detectChanges();
    
    expect(component.products.length).toEqual(0);
    expect(component.loading).toEqual(false);
    expect(component.error).toEqual('Failed to load products. Please try again later.');
  });

  it('should filter products by category', () => {
    productServiceSpy.getProducts.and.returnValue(of(mockProducts));
    
    fixture.detectChanges();
    
    // Initially all products should be shown
    expect(component.filteredProducts.length).toEqual(2);
    
    // Filter by Journal category
    component.filterByCategory('Journal');
    expect(component.selectedCategory).toEqual('Journal');
    expect(component.filteredProducts.length).toEqual(1);
    expect(component.filteredProducts[0].name).toEqual('Test Book 1');
    
    // Filter by Sketchbook category
    component.filterByCategory('Sketchbook');
    expect(component.selectedCategory).toEqual('Sketchbook');
    expect(component.filteredProducts.length).toEqual(1);
    expect(component.filteredProducts[0].name).toEqual('Test Book 2');
    
    // Reset filter
    component.filterByCategory(null);
    expect(component.selectedCategory).toBeNull();
    expect(component.filteredProducts.length).toEqual(2);
  });
}); 