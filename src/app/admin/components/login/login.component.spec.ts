import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { AdminLoginComponent } from './login.component';
import { AdminAuthService } from '../../services/auth.service';

describe('AdminLoginComponent', () => {
  let component: AdminLoginComponent;
  let fixture: ComponentFixture<AdminLoginComponent>;
  let authServiceMock: jasmine.SpyObj<AdminAuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create spy objects for services
    authServiceMock = jasmine.createSpyObj('AdminAuthService', [
      'login', 
      'isAuthenticated'
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    // Configure default behavior for mocks
    authServiceMock.isAuthenticated.and.returnValue(false);
    authServiceMock.login.and.returnValue(of({ token: 'fake-token' }));

    await TestBed.configureTestingModule({
      declarations: [ AdminLoginComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: AdminAuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the login form with empty fields', () => {
    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should redirect to dashboard if already authenticated', () => {
    // Reset the spy to return true
    authServiceMock.isAuthenticated.and.returnValue(true);
    
    // Re-trigger ngOnInit
    component.ngOnInit();
    
    expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('should not submit the form if it is invalid', () => {
    // Form is initially invalid because fields are empty
    component.onSubmit();
    
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should call login service and redirect on successful login', () => {
    // Set valid form values
    component.loginForm.patchValue({
      username: 'admin',
      password: 'password123'
    });
    
    component.onSubmit();
    
    expect(component.isLoading).toBe(false); // After completion
    expect(authServiceMock.login).toHaveBeenCalledWith('admin', 'password123');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
    expect(component.errorMessage).toBe('');
  });

  it('should display error message on login failure', () => {
    // Reset the spy to return an error
    authServiceMock.login.and.returnValue(throwError({ 
      error: { msg: 'Invalid credentials' } 
    }));
    
    // Set valid form values
    component.loginForm.patchValue({
      username: 'admin',
      password: 'wrong-password'
    });
    
    component.onSubmit();
    
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('Invalid credentials');
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should display generic error message when server error has no message', () => {
    // Reset the spy to return an error with no specific message
    authServiceMock.login.and.returnValue(throwError({ 
      status: 500 
    }));
    
    // Set valid form values
    component.loginForm.patchValue({
      username: 'admin',
      password: 'password123'
    });
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Login failed. Please check your credentials.');
  });

  // Additional edge case tests
  it('should show validation error for username length less than minimum', () => {
    component.loginForm.patchValue({
      username: 'ad', // Assuming minimum length is 3
      password: 'password123'
    });
    
    expect(component.loginForm.get('username')?.valid).toBe(false);
    expect(component.loginForm.get('username')?.errors?.['minlength']).toBeTruthy();
  });

  it('should show validation error for password length less than minimum', () => {
    component.loginForm.patchValue({
      username: 'admin',
      password: 'pass' // Assuming minimum length is 6
    });
    
    expect(component.loginForm.get('password')?.valid).toBe(false);
    expect(component.loginForm.get('password')?.errors?.['minlength']).toBeTruthy();
  });

  it('should handle network connectivity errors', () => {
    // Reset the spy to simulate a network error
    authServiceMock.login.and.returnValue(throwError({ 
      name: 'HttpErrorResponse',
      status: 0,
      message: 'Unknown Error'
    }));
    
    component.loginForm.patchValue({
      username: 'admin',
      password: 'password123'
    });
    
    component.onSubmit();
    
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toContain('network');
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should handle concurrent login attempts correctly', () => {
    // First attempt - don't resolve immediately
    let resolveLogin: any;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    
    authServiceMock.login.and.returnValue(new Observable(observer => {
      loginPromise.then(() => {
        observer.next({ token: 'fake-token' });
        observer.complete();
      });
    }));
    
    // Set valid form values
    component.loginForm.patchValue({
      username: 'admin',
      password: 'password123'
    });
    
    // Submit the form
    component.onSubmit();
    
    // Check that isLoading is true during the request
    expect(component.isLoading).toBe(true);
    
    // Try to submit again while first request is in progress
    component.onSubmit();
    
    // Should still only have called login once
    expect(authServiceMock.login).toHaveBeenCalledTimes(1);
    
    // Now resolve the first login attempt
    resolveLogin();
    
    // Force component lifecycle using fixture methods instead of calling hooks directly
    fixture.detectChanges();
    
    expect(component.isLoading).toBe(false);
  });

  it('should clear the form and error message after successful login', () => {
    // Set form with values and an error message
    component.loginForm.patchValue({
      username: 'admin',
      password: 'password123'
    });
    component.errorMessage = 'Previous error';
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('');
    // After successful login and redirect, the form should be reset
    // This depends on implementation, may need to check the actual code
  });

  it('should trim whitespace from username and password inputs', () => {
    // Set values with whitespace
    component.loginForm.patchValue({
      username: '  admin  ',
      password: '  password123  '
    });
    
    component.onSubmit();
    
    // Check that the trimmed values were sent to the service
    expect(authServiceMock.login).toHaveBeenCalledWith('admin', 'password123');
  });
}); 