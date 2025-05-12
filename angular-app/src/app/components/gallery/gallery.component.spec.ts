import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GalleryComponent } from './gallery.component';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/postgrest-js';
import { fakeAsync, tick } from '@angular/core/testing';

describe('GalleryComponent', () => {
  let component: GalleryComponent;
  let fixture: ComponentFixture<GalleryComponent>;
  let supabaseService: jasmine.SpyObj<SupabaseAuthService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    supabaseService = jasmine.createSpyObj('SupabaseAuthService', [
      'fluxProfile',
      'ensureSessionLoaded',
      'authChanges',
      'fluxImages',
      'deleteFluxImage'
    ]);

    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    // Setup default spy behaviors
    supabaseService.ensureSessionLoaded.and.resolveTo(null);
    supabaseService.authChanges.and.callFake((callback) => {
      return { data: { subscription: {} as Subscription } };
    });

    await TestBed.configureTestingModule({
      imports: [
        GalleryComponent,
        RouterTestingModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule
      ],
      providers: [
        { provide: SupabaseAuthService, useValue: supabaseService },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getFluxProfile', () => {
    const testSession: Session = {
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: { id: '123', email: 'test@test.com' } as any
    };

    it('should set profile data when successful', async () => {
      const mockProfile = { id: '123', email: 'test@test.com', name: 'Test User' };
      supabaseService.fluxProfile.and.resolveTo({
        data: mockProfile,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      await component.getFluxProfile(testSession);

      expect(component.profile).toEqual(mockProfile);
    });

    it('should handle error when profile fetch fails', fakeAsync(() => {
      const error: PostgrestError = {
        message: 'Profile fetch failed',
        details: 'Test error details',
        hint: 'Test hint',
        code: 'TEST123',
        name: 'PostgrestError'
      };

      (supabaseService.fluxProfile as jasmine.Spy).and.callFake(async () => {
        return Promise.resolve({ data: null, error, status: 400 });
      });
      
      supabaseService.fluxProfile.and.resolveTo({
        data: null,
        error,
        status: 500,
        statusText: 'Internal Server Error',
        count: null
      });

      spyOn(console, 'log');

      component.getFluxProfile(testSession);
      tick(); // Wait for all async operations to complete

      expect(component.profile).toBeNull();
      expect(console.log).toHaveBeenCalledWith(error);
    }));
  });

  describe('getGeneratedImages', () => {
    it('should load images successfully', async () => {
      const mockImages = [
        { id: '1', prompt: 'test1', image_url: 'url1' },
        { id: '2', prompt: 'test2', image_url: 'url2' }
      ];

      component.profile = { id: '123' };
      supabaseService.fluxImages.and.resolveTo({
        data: mockImages,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      await component.getGeneratedImages();

      expect(component.images).toEqual(mockImages);
      expect(component.isLoading).toBeFalse();
    });

    it('should handle empty image list', async () => {
      component.profile = { id: '123' };
      supabaseService.fluxImages.and.resolveTo({
        data: [],
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      await component.getGeneratedImages();

      expect(component.images).toEqual([]);
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('deleteFluxImage', () => {
    it('should delete image and show success message', async () => {
      const imageId = 'test-image-id';
      component.profile = { id: '123' };
      
      supabaseService.deleteFluxImage.and.resolveTo({
        data: null,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });
      
      supabaseService.fluxImages.and.resolveTo({
        data: [],
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      await component.deleteFluxImage(imageId);

      expect(snackBar.open).toHaveBeenCalledWith(
        'Image deleted successfully',
        'Close',
        jasmine.any(Object)
      );
      expect(supabaseService.fluxImages).toHaveBeenCalled();
    });

    it('should handle delete error', async () => {
      const imageId = 'test-image-id';
      component.profile = { id: '123' };
      
      const error = new Error('Delete failed');
      supabaseService.deleteFluxImage.and.rejectWith(error);

      spyOn(console, 'error');

      await component.deleteFluxImage(imageId);

      expect(console.error).toHaveBeenCalledWith('Error deleting image:', error);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Error deleting image',
        'Close',
        jasmine.any(Object)
      );
    });
  });

  describe('downloadImage', () => {
    it('should create and click download link', fakeAsync(() => {
      const mockImage = {
        id: '1',
        prompt: 'test',
        image_url: 'http://test.com/image.png'
      };

      // Create a proper mock of HTMLAnchorElement
      const mockAnchor = document.createElement('a');
      const mockCreateElement = spyOn(document, 'createElement').and.returnValue(mockAnchor);
      const mockAppendChild = spyOn(document.body, 'appendChild');
      const mockRemoveChild = spyOn(document.body, 'removeChild');
      const mockClick = spyOn(mockAnchor, 'click');

      component.downloadImage(mockImage);
      tick(200); // Wait for all async operations to complete

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAnchor.href).toBe(mockImage.image_url);
      expect(mockAnchor.download).toMatch(/^ai-creation-\d{13}\.png$/);
      expect(mockClick).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalledWith(mockAnchor);
      expect(mockRemoveChild).toHaveBeenCalledWith(mockAnchor);
    }));

    it('should not proceed if image_url is missing', async () => {
      const mockImage = { id: '1', prompt: 'test' };
      const mockCreateElement = spyOn(document, 'createElement');

      await component.downloadImage(mockImage);

      expect(mockCreateElement).not.toHaveBeenCalled();
    });
  });
});