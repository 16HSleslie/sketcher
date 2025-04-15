import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = '/api/uploads';

  constructor(private http: HttpClient) { }

  /**
   * Get auth headers with the token
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'x-auth-token': token || ''
    });
  }

  /**
   * Upload a generic file
   * @param file The file to upload
   * @returns Observable with upload response
   */
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.http.post(`${this.apiUrl}`, formData, {
      headers: this.getHeaders()
    });
  }

  /**
   * Upload a book cover image
   * @param file The cover image to upload
   * @returns Observable with upload response
   */
  uploadBookCover(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('cover', file);
    
    return this.http.post(`${this.apiUrl}/book-cover`, formData, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get a file by key
   * @param key The S3 object key
   * @returns Observable with file data
   */
  getFile(key: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${key}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  /**
   * Get a signed URL for temporary access to a file
   * @param key The S3 object key
   * @param expires Expiration time in seconds (default: 60)
   * @returns Observable with signed URL
   */
  getSignedUrl(key: string, expires: number = 60): Observable<any> {
    return this.http.get(`${this.apiUrl}/signed/${key}`, {
      headers: this.getHeaders(),
      params: { expires: expires.toString() }
    });
  }

  /**
   * List files in a folder
   * @param folder The folder name
   * @returns Observable with list of files
   */
  listFiles(folder: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/list/${folder}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Delete a file by key
   * @param key The S3 object key
   * @returns Observable with deletion status
   */
  deleteFile(key: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${key}`, {
      headers: this.getHeaders()
    });
  }
} 