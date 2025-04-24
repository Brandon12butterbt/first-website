import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/postgrest-js';
import { fakeAsync, tick } from '@angular/core/testing';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let supabaseService: jasmine.SpyObj<SupabaseAuthService>;

  beforeEach(async () => {
    supabaseService = jasmine.createSpyObj('SupabaseAuthService', [
      'profile',
      'ensureSessionLoaded',
      'authChanges'
    ]);

    // Setup default spy behaviors
    supabaseService.ensureSessionLoaded.and.resolveTo(null);
    supabaseService.authChanges.and.callFake((callback) => {
      return { data: { subscription: {} as Subscription } };
    });

    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        RouterTestingModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule
      ],
      providers: [
        { provide: SupabaseAuthService, useValue: supabaseService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getProfile', () => {
    const testSession: Session = {
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: { id: '123', email: 'test@test.com' } as any
    };

    it('should set profile data when successful', fakeAsync(() => {
      const mockProfile = { id: '123', email: 'test@test.com', name: 'Test User' };
      supabaseService.profile.and.resolveTo({
        data: mockProfile,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      component.getProfile(testSession);
      tick(); // Wait for all async operations to complete

      expect(component.profile).toEqual(mockProfile);
    }));

    it('should handle error when profile fetch fails', fakeAsync(() => {
      const error: PostgrestError = {
        message: 'Profile fetch failed',
        details: 'Test error details',
        hint: 'Test hint',
        code: 'TEST123',
        name: 'TestError'
      };
    
      (supabaseService.profile as jasmine.Spy).and.callFake(async () => {
        const error = { code: 'PGRST116', message: 'Simulated error' };
        return Promise.resolve({ data: null, error, status: 400 });
      });
      
      supabaseService.profile.and.resolveTo({
        data: null,
        error,
        status: 500,
        statusText: 'Internal Server Error',
        count: null
      });

      spyOn(console, 'log');

      component.getProfile(testSession);
      tick(); // Wait for all async operations to complete

      expect(component.profile).toBeNull();
      expect(console.log).toHaveBeenCalled();
    }));
  });

  describe('ngOnInit', () => {
    const testSession: Session = {
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: { id: '123', email: 'test@test.com' } as any
    };

    
it('should load profile when session exists', fakeAsync(() => {
    const mockProfile = { id: '123', email: 'test@test.com', name: 'Test User' };
    
    supabaseService.ensureSessionLoaded.and.resolveTo(testSession);
    supabaseService.profile.and.resolveTo({
      data: mockProfile,
      error: null,
      count: null,
      status: 200,
      statusText: 'OK'
    });
  
    component.ngOnInit();
    tick(); // Wait for all async operations to complete
  
    expect(component.session).toEqual(testSession);
    expect(component.profile).toEqual(mockProfile);
    expect(component.userEmail).toEqual(mockProfile.email);
  }));

    it('should not load profile when no session exists', async () => {
      supabaseService.ensureSessionLoaded.and.resolveTo(null);

      await component.ngOnInit();

      expect(component.session).toBeNull();
      expect(component.profile).toBeNull();
      expect(component.userEmail).toEqual('');
    });

    it('should set up auth change listener', fakeAsync(() => {
      let authCallback: (event: AuthChangeEvent, session: Session | null) => void;
      supabaseService.authChanges.and.callFake((callback) => {
        authCallback = callback;
        return { data: { subscription: {} as Subscription } };
      });

      component.ngOnInit();
      tick(); // Wait for all async operations to complete

      const mockProfile = { id: '123', email: 'test@test.com', name: 'Test User' };
      supabaseService.profile.and.resolveTo({
        data: mockProfile,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      // Simulate auth change
      authCallback!('SIGNED_IN', testSession);
      tick(); // Wait for all async operations to complete

      expect(component.session).toEqual(testSession);
      expect(component.profile).toEqual(mockProfile);
      expect(component.userEmail).toEqual(mockProfile.email);
    }));
  });
});