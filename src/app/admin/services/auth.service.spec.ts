import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminAuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AdminAuthService', () => {
  let service: AdminAuthService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminAuthService]
    });
    
    service = TestBed.inject(AdminAuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    // Verify that there are no outstanding http requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully', () => {
    const mockResponse = { token: 'fake-token' };
    const username = 'admin';
    const password = 'password';
    
    service.login(username, password).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(service.isAuthenticated()).toBeTrue();
      expect(localStorage.getItem('admin_token')).toBe('fake-token');
    });
    
    const req = httpMock.expectOne(`${environment.apiUrl}/api/admin/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username, password });
    
    req.flush(mockResponse);
  });

  it('should log out and clear token', () => {
    // Set a token first
    localStorage.setItem('admin_token', 'fake-token');
    
    expect(service.isAuthenticated()).toBeTrue();
    
    service.logout();
    
    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('admin_token')).toBeNull();
  });

  it('should get the token from localStorage', () => {
    localStorage.setItem('admin_token', 'fake-token');
    
    expect(service.getToken()).toBe('fake-token');
  });

  it('should get the admin profile', () => {
    const mockProfile = {
      _id: '1',
      username: 'admin',
      email: 'admin@example.com',
      lastLogin: new Date().toISOString()
    };
    
    service.getAdminProfile().subscribe(profile => {
      expect(profile).toEqual(mockProfile);
    });
    
    const req = httpMock.expectOne(`${environment.apiUrl}/api/admin/me`);
    expect(req.request.method).toBe('GET');
    
    req.flush(mockProfile);
  });

  it('should check if authenticated using hasToken', () => {
    // Initially no token
    expect(service.isAuthenticated()).toBeFalse();
    
    // Set token
    localStorage.setItem('admin_token', 'fake-token');
    
    // Should now be authenticated
    expect(service.isAuthenticated()).toBeTrue();
    
    // Remove token
    localStorage.removeItem('admin_token');
    
    // Should no longer be authenticated
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should expose authentication state as observable', (done) => {
    // Initially not authenticated
    service.isAuthenticated$.subscribe(isAuthenticated => {
      expect(isAuthenticated).toBeFalse();
      done();
    });
    
    // Should already have emitted
  });

  it('should update authentication state on login and logout', () => {
    const authStates: boolean[] = [];
    
    // Subscribe to authentication state changes
    const subscription = service.isAuthenticated$.subscribe(state => {
      authStates.push(state);
    });
    
    // Simulate login
    const mockResponse = { token: 'fake-token' };
    service.login('admin', 'password').subscribe();
    
    const req = httpMock.expectOne(`${environment.apiUrl}/api/admin/login`);
    req.flush(mockResponse);
    
    // Simulate logout
    service.logout();
    
    // Cleanup subscription
    subscription.unsubscribe();
    
    // Should have recorded 3 states: initial (false), after login (true), after logout (false)
    expect(authStates).toEqual([false, true, false]);
  });
}); 