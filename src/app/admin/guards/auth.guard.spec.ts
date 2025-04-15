import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AdminAuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceMock: jasmine.SpyObj<AdminAuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AdminAuthService', ['isAuthenticated']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AdminAuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation when user is authenticated', () => {
    authServiceMock.isAuthenticated.and.returnValue(true);
    
    const result = guard.canActivate();
    
    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    authServiceMock.isAuthenticated.and.returnValue(false);
    
    const result = guard.canActivate();
    
    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/login']);
  });
}); 