import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProductDetailComponent } from './product-detail.component';
import { ProductService } from '../../services/product.service';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  const mockProduct = {
    _id: '1',
    name: 'Test Book 1',
    description: 'A test book description',
    price: 25.99,
    images: ['image1.jpg', 'image2.jpg'],
    category: 'Journal',
    stock: 10,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProductService', ['getProduct']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      declarations: [ProductDetailComponent],
      providers: [
        { provide: ProductService, useValue: spy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' }))
          }
        }
      ]
    }).compileComponents();

    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    productServiceSpy.getProduct.and.returnValue(of(mockProduct));
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  it('should load product details on init', () => {
    productServiceSpy.getProduct.and.returnValue(of(mockProduct));
    
    fixture.detectChanges();
    
    expect(component.product).toEqual(mockProduct);
    expect(component.loading).toEqual(false);
    expect(component.error).toBeNull();
    expect(component.currentImageIndex).toEqual(0);
  });

  it('should handle errors when loading product', () => {
    productServiceSpy.getProduct.and.returnValue(throwError(() => new Error('Test error')));
    
    fixture.detectChanges();
    
    expect(component.product).toBeNull();
    expect(component.loading).toEqual(false);
    expect(component.error).toEqual('Failed to load product details. Please try again later.');
  });

  it('should change the current image', () => {
    productServiceSpy.getProduct.and.returnValue(of(mockProduct));
    
    fixture.detectChanges();
    
    // Initial image should be the first one
    expect(component.currentImage).toEqual('image1.jpg');
    
    // Change to second image
    component.changeImage(1);
    expect(component.currentImageIndex).toEqual(1);
    expect(component.currentImage).toEqual('image2.jpg');
    
    // Try to set an invalid index (should not change)
    component.changeImage(5);
    expect(component.currentImageIndex).toEqual(1); // Should remain unchanged
  });
}); 