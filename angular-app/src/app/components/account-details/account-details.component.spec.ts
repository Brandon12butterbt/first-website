import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { AccountDetailsComponent } from './account-details.component';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Session } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/postgrest-js';

describe('AccountDetailsComponent', () => {
  let component: AccountDetailsComponent;
  let fixture: ComponentFixture<AccountDetailsComponent>;
  let supabaseService: jasmine.SpyObj<SupabaseAuthService>;

  const mockProfile = {
    id: '123',
    email: 'test@test.com',
    credits: 50,
    images_generated: 25,
    created_at: '2025-04-20T10:00:00.000Z'
  };

  beforeEach(async () => {
    supabaseService = jasmine.createSpyObj('SupabaseAuthService', [
      'getSession',
      'fluxProfile'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        AccountDetailsComponent,
        RouterTestingModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule
      ],
      providers: [
        { provide: SupabaseAuthService, useValue: supabaseService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountDetailsComponent);
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

    it('should load profile when session exists', fakeAsync(() => {
      supabaseService.getSession.and.resolveTo(testSession);
      supabaseService.fluxProfile.and.resolveTo({
        data: mockProfile,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      component.ngOnInit();
      tick();

      expect(component.session).toEqual(testSession);
      expect(component.profile).toEqual(mockProfile);
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle null profile when no session exists', fakeAsync(() => {
      supabaseService.getSession.and.resolveTo(null);

      component.ngOnInit();
      tick();

      expect(component.session).toBeNull();
      expect(component.profile).toBeNull();
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('getFluxProfile', () => {
    const testSession: Session = {
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: { id: '123', email: 'test@test.com' } as any
    };

    it('should set profile data when successful', fakeAsync(() => {
      supabaseService.fluxProfile.and.resolveTo({
        data: mockProfile,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      component.getFluxProfile(testSession);
      tick();

      expect(component.profile).toEqual(mockProfile);
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle error when profile fetch fails', fakeAsync(() => {
      const error: PostgrestError = {
        message: 'Profile fetch failed',
        details: 'Test error details',
        hint: 'Test hint',
        code: 'TEST123',
        name: 'PostgrestError'
      };

      supabaseService.fluxProfile.and.resolveTo({
        data: null,
        error,
        status: 500,
        statusText: 'Internal Server Error',
        count: null
      });

      spyOn(console, 'log');

      component.getFluxProfile(testSession);
      tick();

      expect(component.profile).toBeNull();
      expect(console.log).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle timeout when loading takes too long', fakeAsync(() => {
        spyOn(console, 'warn');
      
        supabaseService.getSession.and.callFake(() => {
          return new Promise(resolve => setTimeout(() => resolve(testSession), 10000));
        });
      
        supabaseService.fluxProfile.and.resolveTo({
          data: mockProfile,
          error: null,
          count: null,
          status: 200,
          statusText: 'OK'
        });
      
        component.ngOnInit();
      
        tick(8000);
        expect(console.warn).toHaveBeenCalledWith('Timeout reached: forcing isLoading = false');
      
        tick(2000);
        flushMicrotasks();
      
        expect(component.isLoading).toBeFalse();
      }));
  });
});