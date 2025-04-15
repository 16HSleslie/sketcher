import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AdminProductsComponent } from './products.component';
import { ProductService, Product } from '../../services/product.service';
import { UploadService } from '../../../services/upload.service';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('AdminProductsComponent', () => {
  let component: AdminProductsComponent;
  let fixture: ComponentFixture<AdminProductsComponent>;
  let productServiceMock: any;
  let uploadServiceMock: any;
  
  const mockProducts: Product[] = [
    {
      _id: '1',
      name: 'Journal',
      description: 'A high-quality journal for writing',
      price: 19.99,
      images: ['journal.jpg'],
      category: 'Journal',
      stock: 10,
      isAvailable: true
    },
    {
      _id: '2',
      name: 'Sketchbook',
      description: 'Perfect for artists',
      price: 24.99,
      images: ['sketchbook.jpg'],
      category: 'Sketchbook',
      stock: 5,
      isAvailable: true
    },
    {
      _id: '3',
      name: 'Photo Album',
      description: 'Store your memories',
      price: 29.99,
      images: ['album.jpg'],
      category: 'Photo Album',
      stock: 0,
      isAvailable: false
    }
  ];

  const mockUploadResponse = {
    success: true,
    file: {
      key: 'test-key',
      location: 'https://test-bucket.s3.amazonaws.com/test-image.jpg',
      etag: 'test-etag',
      size: 1000,
      mimetype: 'image/jpeg',
      originalName: 'test-image.jpg'
    }
  };

  beforeEach(async () => {
    // Create mock using direct object instead of jasmine.createSpyObj to avoid DI issues
    productServiceMock = {
      getProducts: jest.fn().mockReturnValue(of(mockProducts)),
      createProduct: jest.fn().mockReturnValue(of({
        _id: '4',
        name: 'New Product',
        description: 'New product description',
        price: 39.99,
        images: ['new.jpg'],
        category: 'Other',
        stock: 10,
        isAvailable: true
      } as Product)),
      updateProduct: jest.fn().mockImplementation((id, product) => {
        return of({
          ...product,
          _id: id
        } as Product);
      }),
      deleteProduct: jest.fn().mockReturnValue(of({})),
      updateStock: jest.fn().mockImplementation((id, stock) => {
        const product = mockProducts.find(p => p._id === id);
        return of({
          ...product,
          stock
        } as Product);
      })
    };

    uploadServiceMock = {
      uploadFile: jest.fn().mockReturnValue(of(mockUploadResponse))
    };

    await TestBed.configureTestingModule({
      declarations: [ AdminProductsComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: UploadService, useValue: uploadServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA] // Add these to handle unknown elements
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeDefined();
  });

  it('should load products on init', () => {
    expect(productServiceMock.getProducts).toHaveBeenCalled();
    expect(component.products).toEqual(mockProducts);
    expect(component.filteredProducts).toEqual(mockProducts);
    expect(component.isLoading).toBe(false);
  });

  it('should handle error when loading products', () => {
    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Reset the product service spy to return an error
    productServiceMock.getProducts.mockReturnValue(throwError('Error loading products'));
    
    // Call the method directly
    component.loadProducts();
    
    expect(console.error).toHaveBeenCalledWith('Error loading products:', 'Error loading products');
    expect(component.isLoading).toBe(false);
    
    // Clean up
    (console.error as jest.Mock).mockRestore();
  });

  it('should filter products by category', () => {
    component.onCategoryFilterChange('Journal');
    
    expect(component.categoryFilter).toBe('Journal');
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].name).toBe('Journal');
  });

  it('should filter products by availability', () => {
    component.onAvailabilityFilterChange('available');
    
    expect(component.availabilityFilter).toBe('available');
    expect(component.filteredProducts.length).toBe(2);
    expect(component.filteredProducts.every(p => p.isAvailable)).toBe(true);
    
    component.onAvailabilityFilterChange('unavailable');
    
    expect(component.availabilityFilter).toBe('unavailable');
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts.every(p => !p.isAvailable)).toBe(true);
  });

  it('should filter products by search term', () => {
    const event = { target: { value: 'sketch' } } as unknown as Event;
    component.onSearch(event);
    
    expect(component.searchTerm).toBe('sketch');
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].name).toBe('Sketchbook');
  });

  it('should prepare form for adding a new product', () => {
    component.addProduct();
    
    expect(component.isAddMode).toBe(true);
    expect(component.isEditMode).toBe(false);
    expect(component.selectedProduct).toBeNull();
    expect(component.productForm.get('name')?.value).toBe('');
    expect(component.productForm.get('isAvailable')?.value).toBe(true);
  });

  it('should prepare form for editing a product', () => {
    component.editProduct(mockProducts[0]);
    
    expect(component.isEditMode).toBe(true);
    expect(component.isAddMode).toBe(false);
    expect(component.selectedProduct).toBe(mockProducts[0]);
    expect(component.productForm.get('name')?.value).toBe('Journal');
    expect(component.productForm.get('price')?.value).toBe(19.99);
  });

  it('should cancel edit mode', () => {
    // First set to edit mode
    component.editProduct(mockProducts[0]);
    
    // Then cancel
    component.cancelEdit();
    
    expect(component.isEditMode).toBe(false);
    expect(component.isAddMode).toBe(false);
    expect(component.selectedProduct).toBeNull();
  });

  it('should not save the product when form is invalid', () => {
    component.addProduct();
    // Form is invalid because required fields are empty
    component.saveProduct();
    
    expect(productServiceMock.createProduct).not.toHaveBeenCalled();
  });

  it('should create a new product', () => {
    component.addProduct();
    
    // Set valid form values
    component.productForm.patchValue({
      name: 'New Product',
      description: 'New product description',
      price: 39.99,
      category: 'Other',
      stock: 10,
      isAvailable: true,
      images: ['new.jpg']
    });
    
    component.saveProduct();
    
    expect(productServiceMock.createProduct).toHaveBeenCalled();
    expect(component.products.length).toBe(4);
    expect(component.isAddMode).toBe(false);
  });

  it('should update an existing product', () => {
    // First set to edit mode
    component.editProduct(mockProducts[0]);
    
    // Update form values
    component.productForm.patchValue({
      name: 'Updated Journal',
      price: 29.99
    });
    
    component.saveProduct();
    
    expect(productServiceMock.updateProduct).toHaveBeenCalledWith('1', expect.objectContaining({
      name: 'Updated Journal',
      price: 29.99
    }));
    expect(component.isEditMode).toBe(false);
  });

  it('should delete a product after confirmation', () => {
    // Mock the confirm dialog to return true
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    
    component.deleteProduct(mockProducts[0]);
    
    expect(productServiceMock.deleteProduct).toHaveBeenCalledWith('1');
    expect(component.products.length).toBe(2);
    
    // Restore original
    window.confirm = originalConfirm;
  });

  it('should not delete a product if confirmation is cancelled', () => {
    // Mock the confirm dialog to return false
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => false);
    
    component.deleteProduct(mockProducts[0]);
    
    expect(productServiceMock.deleteProduct).not.toHaveBeenCalled();
    expect(component.products.length).toBe(3);
    
    // Restore original
    window.confirm = originalConfirm;
  });

  it('should update product stock', () => {
    component.updateStock(mockProducts[0], 20);
    
    expect(productServiceMock.updateStock).toHaveBeenCalledWith('1', 20);
  });

  it('should toggle product availability', () => {
    const product = mockProducts[0];
    const initialAvailability = product.isAvailable;
    
    component.toggleAvailability(product);
    
    expect(productServiceMock.updateProduct).toHaveBeenCalledWith('1', { 
      isAvailable: !initialAvailability 
    });
  });

  it('should handle image file selection and upload', () => {
    const file = new File(['dummy content'], 'test-image.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file], value: '' } } as unknown as Event;
    
    component.onImageFileSelected(event);
    
    expect(component.uploading).toBe(true); // Should be true initially
    
    // Manually call the "next" callback to simulate completion
    const nextCallback = uploadServiceMock.uploadFile.mock.calls[0][1].next;
    nextCallback(mockUploadResponse);
    
    expect(component.uploading).toBe(false);
    expect(component.productForm.get('images')?.value).toContain(mockUploadResponse.file.location);
    expect(component.imagePreviewUrls).toContain(mockUploadResponse.file.location);
  });

  it('should handle upload errors gracefully', () => {
    // Spy on console.error and alert
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Override the mock for this test
    uploadServiceMock.uploadFile.mockReturnValue(throwError('Upload error'));
    
    const file = new File(['dummy content'], 'test-image.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file], value: '' } } as unknown as Event;
    
    component.onImageFileSelected(event);
    
    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
    expect(component.uploading).toBe(false);
    
    // Clean up
    (console.error as jest.Mock).mockRestore();
    (window.alert as jest.Mock).mockRestore();
  });

  it('should remove an image from the form', () => {
    // Setup initial state with images
    component.productForm.get('images')?.setValue(['image1.jpg', 'image2.jpg', 'image3.jpg']);
    component.imagePreviewUrls = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
    
    // Remove the second image
    component.removeImage(1);
    
    // Check the result
    expect(component.productForm.get('images')?.value).toEqual(['image1.jpg', 'image3.jpg']);
    expect(component.imagePreviewUrls).toEqual(['image1.jpg', 'image3.jpg']);
  });

  it('should load image previews when editing a product', () => {
    component.editProduct(mockProducts[0]);
    
    expect(component.imagePreviewUrls).toEqual(mockProducts[0].images);
  });

  it('should validate file type during upload', () => {
    // Mock alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Test with invalid file type
    const invalidFile = new File(['dummy content'], 'test-doc.pdf', { type: 'application/pdf' });
    const event = { target: { files: [invalidFile], value: '' } } as unknown as Event;
    
    component.onImageFileSelected(event);
    
    expect(window.alert).toHaveBeenCalled();
    expect(uploadServiceMock.uploadFile).not.toHaveBeenCalled();
    
    // Clean up
    (window.alert as jest.Mock).mockRestore();
  });

  it('should validate file size during upload', () => {
    // Mock alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Create a large file mock (over 5MB)
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large-image.jpg', { type: 'image/jpeg' });
    Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });
    
    const event = { target: { files: [largeFile], value: '' } } as unknown as Event;
    
    component.onImageFileSelected(event);
    
    expect(window.alert).toHaveBeenCalled();
    expect(uploadServiceMock.uploadFile).not.toHaveBeenCalled();
    
    // Clean up
    (window.alert as jest.Mock).mockRestore();
  });

  it('should handle image URLs input change', () => {
    // Mock the event
    const event = { 
      target: { value: 'image1.jpg, image2.jpg' } 
    } as unknown as Event;
    
    component.onImagesChange(event);
    
    expect(component.productForm.get('images')?.value).toEqual(['image1.jpg', 'image2.jpg']);
    expect(component.imagePreviewUrls).toEqual(['image1.jpg', 'image2.jpg']);
  });
}); 