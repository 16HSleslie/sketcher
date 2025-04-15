import { Component } from '@angular/core';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  isUploading: boolean = false;
  uploadResponse: any = null;
  errorMessage: string = '';
  uploadedFiles: any[] = [];

  constructor(private uploadService: UploadService) { }

  ngOnInit() {
    this.loadFilesList();
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
    // Reset previous upload state
    this.uploadProgress = 0;
    this.errorMessage = '';
    this.uploadResponse = null;
  }

  /**
   * Upload the selected file
   */
  uploadFile() {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first';
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    
    this.uploadService.uploadFile(this.selectedFile)
      .subscribe({
        next: (response) => {
          this.uploadResponse = response;
          this.isUploading = false;
          this.uploadProgress = 100;
          this.loadFilesList(); // Refresh the list
        },
        error: (error) => {
          this.errorMessage = error.message || 'Upload failed';
          this.isUploading = false;
        }
      });
  }

  /**
   * Upload a book cover image
   */
  uploadBookCover() {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first';
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    
    this.uploadService.uploadBookCover(this.selectedFile)
      .subscribe({
        next: (response) => {
          this.uploadResponse = response;
          this.isUploading = false;
          this.uploadProgress = 100;
          this.loadFilesList(); // Refresh the list
        },
        error: (error) => {
          this.errorMessage = error.message || 'Upload failed';
          this.isUploading = false;
        }
      });
  }

  /**
   * Load the list of files from the books folder
   */
  loadFilesList() {
    this.uploadService.listFiles('books')
      .subscribe({
        next: (response) => {
          this.uploadedFiles = response.files;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load files list';
          console.error(error);
        }
      });
  }

  /**
   * Delete a file from S3
   */
  deleteFile(key: string) {
    if (confirm('Are you sure you want to delete this file?')) {
      this.uploadService.deleteFile(key)
        .subscribe({
          next: () => {
            this.loadFilesList(); // Refresh the list
          },
          error: (error) => {
            this.errorMessage = 'Failed to delete file';
            console.error(error);
          }
        });
    }
  }

  /**
   * Get a signed URL for a file
   */
  getSignedUrl(key: string) {
    this.uploadService.getSignedUrl(key)
      .subscribe({
        next: (response) => {
          // Open the URL in a new tab
          window.open(response.url, '_blank');
        },
        error: (error) => {
          this.errorMessage = 'Failed to get signed URL';
          console.error(error);
        }
      });
  }
} 