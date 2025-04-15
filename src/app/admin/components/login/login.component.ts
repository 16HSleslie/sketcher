import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AdminAuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    const { username, password } = this.loginForm.value;
    
    this.authService.login(username, password)
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          this.errorMessage = error.error?.msg || 'Login failed. Please check your credentials.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }
} 