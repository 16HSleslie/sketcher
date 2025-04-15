import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { UploadService } from '../../../services/upload.service';

@Component({
  selector: 'app-admin-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading: boolean = true;
  selectedProduct: Product | null = null;
  isEditMode: boolean = false;
  isAddMode: boolean = false;
  
  // Form for adding/editing products
  productForm: FormGroup;
  
  // Image upload properties
  imagePreviewUrls: string[] = [];
  uploading: boolean = false;
  
  // Filters
  categoryFilter: string = 'all';
  availabilityFilter: string = 'all';
  searchTerm: string = '';
  
  // Available categories
  categories: string[] = ['Journal', 'Sketchbook', 'Photo Album', 'Custom Book', 'Other'];
  
  constructor(
    private productService: ProductService,
    private uploadService: UploadService,
    private fb: FormBuilder
  ) {
    this.productForm = this.createProductForm();
  }
  
  ngOnInit(): void {
    this.loadProducts();
  }
  
  createProductForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      images: [[]],
      category: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      isAvailable: [true]
    });
  }
  
  loadProducts(): void {
    this.isLoading = true;
    
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
  }
  
  applyFilters(): void {
    let filtered = [...this.products];
    
    // Apply category filter
    if (this.categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === this.categoryFilter);
    }
    
    // Apply availability filter
    if (this.availabilityFilter !== 'all') {
      const isAvailable = this.availabilityFilter === 'available';
      filtered = filtered.filter(product => product.isAvailable === isAvailable);
    }
    
    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }
    
    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    this.filteredProducts = filtered;
  }
  
  onCategoryFilterChange(category: string): void {
    this.categoryFilter = category;
    this.applyFilters();
  }
  
  onAvailabilityFilterChange(availability: string): void {
    this.availabilityFilter = availability;
    this.applyFilters();
  }
  
  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }
  
  addProduct(): void {
    this.isAddMode = true;
    this.isEditMode = false;
    this.selectedProduct = null;
    this.productForm.reset({
      isAvailable: true,
      stock: 0,
      price: 0,
      images: []
    });
  }
  
  editProduct(product: Product): void {
    this.selectedProduct = product;
    this.isEditMode = true;
    this.isAddMode = false;
    
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images,
      category: product.category,
      stock: product.stock,
      isAvailable: product.isAvailable
    });
    
    // Load image previews for existing images
    this.imagePreviewUrls = product.images || [];
  }
  
  cancelEdit(): void {
    this.isEditMode = false;
    this.isAddMode = false;
    this.selectedProduct = null;
    this.productForm.reset();
    // Clear image previews
    this.imagePreviewUrls = [];
  }
  
  saveProduct(): void {
    if (this.productForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    const productData: Product = {
      ...this.productForm.value
    };
    
    if (this.isEditMode && this.selectedProduct?._id) {
      // Update existing product
      this.productService.updateProduct(this.selectedProduct._id, productData).subscribe({
        next: (updatedProduct) => {
          // Update product in the list
          const index = this.products.findIndex(p => p._id === this.selectedProduct?._id);
          if (index !== -1) {
            this.products[index] = updatedProduct;
          }
          
          this.applyFilters();
          this.cancelEdit();
        },
        error: (error) => console.error('Error updating product:', error)
      });
    } else if (this.isAddMode) {
      // Add new product
      this.productService.createProduct(productData).subscribe({
        next: (newProduct) => {
          this.products.push(newProduct);
          this.applyFilters();
          this.cancelEdit();
        },
        error: (error) => console.error('Error creating product:', error)
      });
    }
  }
  
  deleteProduct(product: Product): void {
    if (!product._id) return;
    
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product._id).subscribe({
        next: () => {
          // Remove from products array
          this.products = this.products.filter(p => p._id !== product._id);
          this.applyFilters();
        },
        error: (error) => console.error('Error deleting product:', error)
      });
    }
  }
  
  updateStock(product: Product, newStock: number): void {
    if (!product._id) return;
    
    this.productService.updateStock(product._id, newStock).subscribe({
      next: (updatedProduct) => {
        // Update product in the list
        const index = this.products.findIndex(p => p._id === product._id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
        
        this.applyFilters();
      },
      error: (error) => console.error('Error updating stock:', error)
    });
  }
  
  toggleAvailability(product: Product): void {
    if (!product._id) return;
    
    const newAvailability = !product.isAvailable;
    
    this.productService.updateProduct(product._id, { isAvailable: newAvailability }).subscribe({
      next: (updatedProduct) => {
        // Update product in the list
        const index = this.products.findIndex(p => p._id === product._id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
        
        this.applyFilters();
      },
      error: (error) => console.error('Error toggling availability:', error)
    });
  }
  
  // Helper method for form validation
  hasError(controlName: string, errorName: string): boolean {
    const control = this.productForm.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }
  
  // Handle image file selection
  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (!input.files || input.files.length === 0) {
      return;
    }
    
    const file = input.files[0];
    
    // Validate file type and size
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      alert('Only image files (JPEG, PNG, GIF, WEBP) are allowed!');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB!');
      return;
    }
    
    this.uploading = true;
    console.log('Starting image upload:', file.name);
    
    // Upload the file to S3
    this.uploadService.uploadFile(file).subscribe({
      next: (response) => {
        this.uploading = false;
        console.log('Image upload successful:', response);
        
        if (!response.file || !response.file.location) {
          console.error('Upload response missing file location:', response);
          alert('Upload completed but image URL is missing. Please try again or contact support.');
          return;
        }
        
        // Add the S3 location URL to the form
        const currentImages = this.productForm.get('images')?.value || [];
        this.productForm.get('images')?.setValue([...currentImages, response.file.location]);
        
        // Add image to preview
        this.imagePreviewUrls.push(response.file.location);
        
        // Show success message
        alert(`Image "${file.name}" uploaded successfully!`);
        
        // Clear the file input
        input.value = '';
      },
      error: (error) => {
        this.uploading = false;
        console.error('Error uploading image:', error);
        alert('Failed to upload image: ' + (error.message || 'Unknown error'));
        
        // Clear the file input
        input.value = '';
      }
    });
  }
  
  // Remove an image from the product
  removeImage(index: number): void {
    // Get current images
    const currentImages = this.productForm.get('images')?.value || [];
    
    // Remove the image at the specified index
    currentImages.splice(index, 1);
    this.productForm.get('images')?.setValue(currentImages);
    
    // Remove from preview
    this.imagePreviewUrls.splice(index, 1);
  }
  
  // Handle image URLs input change - keeping for legacy support
  onImagesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const imageUrls = input.value.split(',')
      .map(url => url.trim())
      .filter(url => url);
    this.productForm.get('images')?.setValue(imageUrls);
    this.imagePreviewUrls = imageUrls;
  }
} 