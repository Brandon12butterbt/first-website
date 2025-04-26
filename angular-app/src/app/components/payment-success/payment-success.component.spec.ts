import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PaymentSuccessComponent } from './payment-success.component';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { StripeService } from '../../services/stripe.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Session } from '@supabase/supabase-js';

describe('PaymentSuccessComponent', () => {
  let component: PaymentSuccessComponent;
  let fixture: ComponentFixture<PaymentSuccessComponent>;
  let supabaseService: jasmine.SpyObj<SupabaseAuthService>;
  let stripeService: jasmine.SpyObj<StripeService>;
  let router: jasmine.SpyObj<Router>;
  let sessionStorageGetSpy: jasmine.Spy;
  let sessionStorageSetSpy: jasmine.Spy;

  const mockProfile = {
    id: '123',
    email: 'test@test.com',
    credits: 50,
    images_generated: 25,
    created_at: '2025-04-20T10:00:00.000Z'
  };

  const mockTokenResponse = {
    data: {
      package_type: 'standard',
      unique_id: 'test-token-id'
    },
    error: null,
    count: null,
    status: 200,
    statusText: 'OK'
  };

  beforeEach(async () => {
    supabaseService = jasmine.createSpyObj('SupabaseAuthService', [
      'ensureSessionLoaded',
      'fluxProfile',
      'getTokenTracker',
      'deleteTokenTracker',
      'savePurchase',
      'triggerAuthChange'
    ]);

    stripeService = jasmine.createSpyObj('StripeService', ['handlePaymentSuccess']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    // Setup sessionStorage mock
    sessionStorageGetSpy = spyOn(window.sessionStorage, 'getItem');
    sessionStorageSetSpy = spyOn(window.sessionStorage, 'setItem');

    await TestBed.configureTestingModule({
      imports: [
        PaymentSuccessComponent,
        RouterTestingModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule
      ],
      providers: [
        { provide: SupabaseAuthService, useValue: supabaseService },
        { provide: StripeService, useValue: stripeService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentSuccessComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    const testSession: Session = {
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: { id: '123', email: 'test@test.com' } as any
    };

    it('should initialize component with session', fakeAsync(() => {
      supabaseService.ensureSessionLoaded.and.resolveTo(testSession);
      supabaseService.fluxProfile.and.resolveTo({
        data: mockProfile,
        error: null,
        status: 200,
        statusText: 'OK',
        count: null
      });
      supabaseService.getTokenTracker.and.resolveTo(mockTokenResponse);
      sessionStorageGetSpy.and.returnValue('test-token-id');
      stripeService.handlePaymentSuccess.and.resolveTo(100);

      component.ngOnInit();
      tick();

      expect(component.profile).toEqual(mockProfile);
      expect(component.userEmail).toBe(mockProfile.email);
      expect(component.newCredits).toBe(100);
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle missing session', fakeAsync(() => {
      supabaseService.ensureSessionLoaded.and.resolveTo(null);

      component.ngOnInit();
      tick();

      expect(component.profile).toBeNull();
      expect(component.isLoading).toBeTruthy();
    }));
  });

  describe('checkTokens', () => {
    const testSession: Session = {
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: { id: '123', email: 'test@test.com' } as any
    };

    it('should process valid token and update credits', fakeAsync(() => {
      supabaseService.fluxProfile.and.resolveTo({
        data: mockProfile,
        error: null,
        status: 200,
        statusText: 'OK',
        count: null
      });
      supabaseService.getTokenTracker.and.resolveTo(mockTokenResponse);
      sessionStorageGetSpy.and.returnValue('test-token-id');
      stripeService.handlePaymentSuccess.and.resolveTo(100);

      component.checkTokens(testSession);
      tick();

      expect(component.profile).toEqual(mockProfile);
      expect(component.token).toEqual(mockTokenResponse);
      expect(component.newCredits).toBe(100);
      expect(supabaseService.savePurchase).toHaveBeenCalled();
      expect(supabaseService.deleteTokenTracker).toHaveBeenCalled();
      expect(supabaseService.triggerAuthChange).toHaveBeenCalledWith('SIGNED_IN', testSession);
      expect(component.isLoading).toBeFalse();
    }));

    it('should redirect when no token exists', fakeAsync(() => {
      supabaseService.fluxProfile.and.resolveTo({
        data: mockProfile,
        error: null,
        status: 200,
        statusText: 'OK',
        count: null
      });
      supabaseService.getTokenTracker.and.resolveTo({
        data: null,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      component.checkTokens(testSession);
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle token mismatch', fakeAsync(() => {
      supabaseService.fluxProfile.and.resolveTo({
        data: mockProfile,
        error: null,
        status: 200,
        statusText: 'OK',
        count: null
      });
      supabaseService.getTokenTracker.and.resolveTo(mockTokenResponse);
      sessionStorageGetSpy.and.returnValue('different-token-id');

      component.checkTokens(testSession);
      tick();

      expect(sessionStorageSetSpy).toHaveBeenCalledWith('token', '');
      expect(supabaseService.deleteTokenTracker).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle profile fetch error', fakeAsync(() => {
      const error = new Error('Profile fetch failed');
      supabaseService.fluxProfile.and.rejectWith(error);
      spyOn(console, 'log');

      component.checkTokens(testSession);
      tick();

      expect(console.log).toHaveBeenCalledWith(error);
      expect(component.isLoading).toBeFalse();
    }));
  });
});