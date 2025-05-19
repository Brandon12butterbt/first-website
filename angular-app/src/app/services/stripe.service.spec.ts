import { TestBed } from '@angular/core/testing';
import { StripeService } from './stripe.service';
import { SupabaseAuthService } from './supabase-auth.service';
import { fakeAsync, tick } from '@angular/core/testing';

describe('StripeService', () => {
  let service: StripeService;
  let supabaseService: jasmine.SpyObj<SupabaseAuthService>;
  let mockProfile: any;

  beforeEach(() => {
    supabaseService = jasmine.createSpyObj('SupabaseAuthService', [
        'updateCredits'
      ]);

    TestBed.configureTestingModule({
      providers: [
        StripeService,
        { provide: SupabaseAuthService, useValue: supabaseService }
      ]
    });

    service = TestBed.inject(StripeService);
    supabaseService.updateCredits.and.resolveTo();
    mockProfile = { id: 'user1', credits: 5 };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle payment success and update credits', fakeAsync(() => {
    service.handlePaymentSuccess(mockProfile, 'basic');
    tick();
    
    expect(supabaseService.updateCredits).toHaveBeenCalledWith('user1', 10);
  }));

  it('should return 0 if package is not found', fakeAsync(() => {
    service.handlePaymentSuccess(mockProfile, 'invalid-id');
    tick();

    expect(supabaseService.updateCredits).not.toHaveBeenCalled();
  }));
});
