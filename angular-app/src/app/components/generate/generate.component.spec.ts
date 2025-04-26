import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GenerateComponent } from './generate.component';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { FluxService } from '../../services/flux.service';
import { ConfigService } from '../../services/config.service';
import { CountdownService } from '../../services/image-countdown.service';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/postgrest-js';
import { of } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

describe('GenerateComponent', () => {
    let component: GenerateComponent;
    let fixture: ComponentFixture<GenerateComponent>;
    let supabaseService: jasmine.SpyObj<SupabaseAuthService>;
    let fluxService: jasmine.SpyObj<FluxService>;
    let configService: jasmine.SpyObj<ConfigService>;
    let countdownService: jasmine.SpyObj<CountdownService>;

    beforeEach(async () => {
        supabaseService = jasmine.createSpyObj('SupabaseAuthService', [
            'fluxProfile',
            'ensureSessionLoaded',
            'authChanges',
            'imageGeneratedUpdateProfile',
            'saveGeneratedImage',
            'triggerAuthChange'
        ]);

        supabaseService.imageGeneratedUpdateProfile.and.returnValue(
            Promise.resolve({}) as unknown as PostgrestFilterBuilder<any, any, null, 'profiles', unknown>
        );

        fluxService = jasmine.createSpyObj('FluxService', ['callGenerateImage']);
        configService = jasmine.createSpyObj('ConfigService', [], {
            turnWidgetSiteKey: 'test-key'
        });
        countdownService = jasmine.createSpyObj('CountdownService', ['startCountdown'], {
            countdown$: of('Ready')
        });

        // Setup default spy behaviors
        supabaseService.ensureSessionLoaded.and.resolveTo(null);
        supabaseService.authChanges.and.callFake((callback) => {
            return { data: { subscription: {} as Subscription } };
        });

        spyOn(window, 'FileReader').and.returnValue({
            readAsDataURL: function (blob: Blob) {
                this.onloadend(); // Trigger immediately
                this.result = 'data:image/png;base64,test-mock-data-url';
            },
        } as any);

        await TestBed.configureTestingModule({
            imports: [
                GenerateComponent,
                RouterTestingModule,
                ReactiveFormsModule,
                BrowserAnimationsModule,
                MatButtonModule,
                MatIconModule,
                MatCardModule,
                MatFormFieldModule,
                MatInputModule
            ],
            providers: [
                FormBuilder,
                { provide: SupabaseAuthService, useValue: supabaseService },
                { provide: FluxService, useValue: fluxService },
                { provide: ConfigService, useValue: configService },
                { provide: CountdownService, useValue: countdownService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(GenerateComponent);
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

        it('should set profile data when successful', fakeAsync(() => {
            const mockProfile = { id: '123', email: 'test@test.com', credits: 10 };
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
            expect(component.hasCredits).toBeTrue();
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
            expect(component.session).toBeNull();
        }));
    });

    describe('onSubmit', () => {
        beforeEach(() => {
            component.profile = { id: '123', credits: 1, images_generated: 0 };
            component.generateForm.patchValue({
                prompt: 'test prompt',
                turnstileToken: 'valid-token'
            });
        });

        it('should generate image successfully', fakeAsync(() => {
            const mockBlob = new Blob(['test'], { type: 'image/png' });
            fluxService.callGenerateImage.and.returnValue(of(mockBlob));

            spyOn(URL, 'createObjectURL').and.returnValue('blob:test-url');
            supabaseService.triggerAuthChange.and.resolveTo();
            console.log('typeof spy:', typeof supabaseService.imageGeneratedUpdateProfile);
            supabaseService.imageGeneratedUpdateProfile.and.returnValue(
                Promise.resolve({}) as unknown as PostgrestFilterBuilder<any, any, null, 'profiles', unknown>
            );

            component.onSubmit();
            tick(100); // For initial state updates
            tick(30000); // For generation timeout

            expect(component.isGenerating).toBeFalse();
            expect(component.generatedImage).toBeTruthy();
            expect(component.errorMessage).toBe('');
            expect(supabaseService.imageGeneratedUpdateProfile).toHaveBeenCalled();
        }));

        it('should handle generation error', fakeAsync(() => {
            fluxService.callGenerateImage.and.throwError('Generation failed');

            component.onSubmit();
            tick(100);
            tick(30000);

            expect(component.isGenerating).toBeFalse();
            expect(component.generatedImage).toBeNull();
            expect(component.errorMessage).toBeTruthy();
        }));

        it('should handle generation timeout', fakeAsync(() => {
            fluxService.callGenerateImage.and.returnValue(of(new Promise(() => { }))); // Never resolves

            component.onSubmit();
            tick(100); // For initial state updates
            tick(30000);

            expect(component.isGenerating).toBeFalse();
            expect(component.errorMessage).toContain('Generation timeout. Please try again.');
        }));
    });

    describe('saveImage', () => {
        it('should save generated image successfully', fakeAsync(() => {
            component.generatedImage = 'blob:test-url';
            component.generateForm.patchValue({ prompt: 'test prompt' });
            component.profile = { id: '123' };
            component.generatedImage = 'blob:test-url';

            component.generateForm = new FormGroup({
                prompt: new FormControl('valid input'),
            });

            const mockFetch = spyOn(window, 'fetch').and.resolveTo({
                blob: () => Promise.resolve(new Blob(['test']))
            } as Response);

            supabaseService.saveGeneratedImage.and.resolveTo();

            component.saveImage();
            tick(12000);

            expect(supabaseService.saveGeneratedImage).toHaveBeenCalled();
            expect(component.saveMessage).toContain('Image saved to your gallery!');

            //   tick(5000); // Wait for notification timeout
            tick(1000); // Wait for notification timeout
            expect(component.showSaveNotification).toBeFalse();
        }));
    });

    describe('downloadImage', () => {
        it('should download blob url image', fakeAsync(() => {
            component.generatedImage = 'blob:test-url';

            const mockLink = document.createElement('a');
            spyOn(document, 'createElement').and.returnValue(mockLink);
            spyOn(mockLink, 'click');
            spyOn(document.body, 'appendChild');
            spyOn(document.body, 'removeChild');

            component.downloadImage();
            tick(100);

            expect(mockLink.href).toBe('blob:test-url');
            expect(mockLink.download).toMatch(/^generated-image-\d+\.png$/);
            expect(mockLink.click).toHaveBeenCalled();
        }));
    });

    describe('onTurnstileSuccess', () => {
        it('should set verification after delay', fakeAsync(() => {
            component.onTurnstileSuccess('token');
            expect(component.isTurnstileVerified).toBeFalse();

            tick(3000);
            expect(component.isTurnstileVerified).toBeTrue();
        }));
    });
});