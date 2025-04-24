import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { SupabaseAuthService } from './services/supabase-auth.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: jasmine.SpyObj<Router>;
  let supabaseService: jasmine.SpyObj<SupabaseAuthService>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate'], {
      events: { subscribe: jasmine.createSpy() }
    });

    supabaseService = jasmine.createSpyObj('SupabaseAuthService', [
      'fluxProfile',
      'createFluxProfile'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule // Provides all necessary router dependencies
      ],
      providers: [
        { provide: Router, useValue: router },
        { provide: SupabaseAuthService, useValue: supabaseService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
            params: { subscribe: jasmine.createSpy() },
            queryParams: { subscribe: jasmine.createSpy() }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getFluxProfile', () => {
    const testSession = { user: { user: {  id: '123', email: 'test@test.com' } } };

    it('should set user session data', async () => {
      await component.getFluxProfile(testSession);
      expect(component.user).toEqual(testSession);
    });

    it('should navigate to root when error occurs', async () => {
      supabaseService.fluxProfile.and.throwError('Test error');
      await component.getFluxProfile(testSession);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should call createFluxProfile when specific error occurs', async () => {
      const testSession = { id: '123', email: 'test@test.com' };
    
      // Mock first call to throw the special error, second call to succeed
      let callCount = 0;
    
      (supabaseService.fluxProfile as jasmine.Spy).and.callFake(async () => {
        callCount++;
        if (callCount === 1) {
          const error = { code: 'PGRST116', message: 'Simulated error' };
          return Promise.resolve({ data: null, error, status: 400 });
        }
        return Promise.resolve({
          data: { name: 'test-profile' },
          error: null,
          status: 200
        });
      });
    
      //This tells the spy to pretend to succeed when createFluxProfile is called.
      //Only Care if the function is called.
      supabaseService.createFluxProfile.and.resolveTo();
    
      await component.getFluxProfile({ user: testSession });
    
      expect(supabaseService.createFluxProfile).toHaveBeenCalledWith('123', 'test@test.com');
      expect(supabaseService.fluxProfile).toHaveBeenCalledTimes(2);
      expect(callCount).toBe(2);
    });
  });
});