import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  template: `
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h2 class="text-center">{{ title }}</h2>
            </div>
            <div class="card-body">
              <div class="alert alert-success text-center">
                <h4>Server Connection Status:</h4>
                <p *ngIf="serverStatus" class="text-success">Connected to Backend!</p>
                <p *ngIf="!serverStatus" class="text-danger">Not Connected</p>
              </div>
              <div class="text-center mt-3">
                <button (click)="checkServerStatus()" class="btn btn-primary">
                  Check Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { 
      font-family: Arial, sans-serif; 
    }
    .card {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .card-header {
      background-color: #007bff !important;
    }
    .btn-primary {
      background-color: #007bff;
      border-color: #007bff;
    }
    .btn-primary:hover {
      background-color: #0069d9;
      border-color: #0062cc;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'MEAN Stack Application';
  serverStatus = false;
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Check server status on component initialization
    this.checkServerStatus();
  }

  checkServerStatus() {
    // Call the API endpoint to check server connection
    this.http.get(`${this.apiUrl}/users`).subscribe(
      (response) => {
        console.log('Server response:', response);
        this.serverStatus = true;
      },
      (error) => {
        console.error('Server connection error:', error);
        this.serverStatus = false;
      }
    );
  }
} 