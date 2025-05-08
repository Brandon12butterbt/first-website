import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { SupabaseAuthService } from '../services/supabase-auth.service';
import { Session } from '@supabase/supabase-js';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockRouter: jasmine.SpyObj<Router>;
  let supabaseService: jasmine.SpyObj<SupabaseAuthService>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    supabaseService = jasmine.createSpyObj('SupabaseAuthService', ['ensureSessionLoaded']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: mockRouter },
        { provide: SupabaseAuthService, useValue: supabaseService }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should return true if session exists', async () => {
    const testSession: Session = {
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: '123', email: 'test@test.com' } as any
    };

    supabaseService.ensureSessionLoaded.and.resolveTo(testSession);
    const result = await guard.canActivate();

    expect(result).toBeTrue();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should return false and navigate if session does not exist', async () => {
    supabaseService.ensureSessionLoaded.and.resolveTo(null);
    const result = await guard.canActivate();

    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});