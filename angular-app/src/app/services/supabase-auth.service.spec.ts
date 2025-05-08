import { TestBed } from '@angular/core/testing';
import { SupabaseAuthService } from './supabase-auth.service';
import { ConfigService } from './config.service';
import { AuthSession, User, WeakPassword } from '@supabase/supabase-js';

describe('SupabaseAuthService', () => {
  let service: SupabaseAuthService;
  let configService: jasmine.SpyObj<ConfigService>;
  
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com' as string,
    app_metadata: {},
    user_metadata: {},
    aud: 'test',
    created_at: '',
    role: ''
  };

  const mockSession: AuthSession = {
    access_token: 'test-token',
    refresh_token: 'test-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser
  } as AuthSession;

  beforeEach(() => {
    configService = jasmine.createSpyObj('ConfigService', [], {
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test-anon-key'
    });

    TestBed.configureTestingModule({
      providers: [
        SupabaseAuthService,
        { provide: ConfigService, useValue: configService }
      ]
    });

    service = TestBed.inject(SupabaseAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Authentication', () => {
    it('should handle sign in', async () => {
      const signInSpy = spyOn(service['supabase'].auth, 'signInWithPassword')
        .and.returnValue(Promise.resolve({ 
          data: { 
            user: mockUser,
            session: mockSession
          }, 
          error: null 
        }));

      const result = await service.signIn('test@example.com', 'password');
      
      expect(signInSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      });
      expect(result.error).toBeNull();
    });

    it('should handle sign up', async () => {
      const signUpSpy = spyOn(service['supabase'].auth, 'signUp')
        .and.returnValue(Promise.resolve({ 
          data: { 
            user: mockUser,
            session: mockSession
          }, 
          error: null 
        }));

      const result = await service.signUp('test@example.com', 'password');
      
      expect(signUpSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      });
      expect(result.error).toBeNull();
    });

    it('should handle sign out', async () => {
      const signOutSpy = spyOn(service['supabase'].auth, 'signOut')
        .and.returnValue(Promise.resolve({ error: null }));

      await service.signOut();
      
      expect(signOutSpy).toHaveBeenCalled();
    });
  });

  describe('Profile Management', () => {
    it('should get user profile', async () => {
      const selectSpy = spyOn(service['supabase'], 'from').and.returnValue({
        select: jasmine.createSpy().and.returnValue({
          eq: jasmine.createSpy().and.returnValue({
            single: jasmine.createSpy().and.returnValue(
              Promise.resolve({ 
                data: { id: mockUser.id, email: mockUser.email },
                error: null 
              })
            )
          })
        })
      } as any);

      const result = await service.profile(mockUser);
      
      expect(selectSpy).toHaveBeenCalledWith('profiles');
      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        id: mockUser.id,
        email: mockUser.email
      });
    });

    it('should create flux profile', async () => {
      const insertSpy = spyOn(service['supabase'], 'from').and.returnValue({
        insert: jasmine.createSpy().and.returnValue(
          Promise.resolve({ data: null, error: null })
        )
      } as any);

      // Ensure email is not undefined
      const userEmail = mockUser.email || 'test@example.com';
      await service.createFluxProfile(mockUser.id, userEmail);
      
      expect(insertSpy).toHaveBeenCalledWith('profiles');
    });
  });

  describe('Session Management', () => {
    it('should get current session', async () => {
      const getSessionSpy = spyOn(service['supabase'].auth, 'getSession')
        .and.returnValue(Promise.resolve({ 
          data: { 
            session: mockSession
          }, 
          error: null 
        }));

      const result = await service.getSession();
      
      expect(getSessionSpy).toHaveBeenCalled();
      expect(result).toEqual(mockSession);
    });

    it('should ensure session is loaded', async () => {
      spyOn(service['supabase'].auth, 'getSession')
        .and.returnValue(Promise.resolve({ 
          data: { 
            session: mockSession
          }, 
          error: null 
        }));

      const result = await service.ensureSessionLoaded();
      
      expect(result).toEqual(mockSession);
      // Second call should return cached session
      const cachedResult = await service.ensureSessionLoaded();
      expect(cachedResult).toEqual(mockSession);
    });
  });

  describe('Image Management', () => {
    it('should handle saving generated image', async () => {
      const insertSpy = spyOn(service['supabase'], 'from').and.returnValue({
        insert: jasmine.createSpy().and.returnValue(
          Promise.resolve({ data: null, error: null })
        )
      } as any);

      await service.saveGeneratedImage('user-id', 'image-url', 'test prompt');
      
      expect(insertSpy).toHaveBeenCalledWith('generated_images');
    });

    it('should handle deleting flux image', async () => {
      const deleteSpy = spyOn(service['supabase'], 'from').and.returnValue({
        delete: jasmine.createSpy().and.returnValue({
          eq: jasmine.createSpy().and.returnValue({
            eq: jasmine.createSpy().and.returnValue(
              Promise.resolve({ data: null, error: null })
            )
          })
        })
      } as any);

      await service.deleteFluxImage('user-id', 'image-id');
      
      expect(deleteSpy).toHaveBeenCalledWith('generated_images');
    });
  });
});