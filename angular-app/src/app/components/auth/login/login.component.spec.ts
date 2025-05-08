import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SupabaseAuthService } from '../../../services/supabase-auth.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import { mock } from 'node:test';
import { AuthError } from '@supabase/supabase-js';


describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let supabaseService: jasmine.SpyObj<SupabaseAuthService>;

    beforeEach(async () => {
        supabaseService = jasmine.createSpyObj('SupabaseAuthService', [
            'profile',
            'fluxProfile',
            'ensureSessionLoaded',
            'authChanges',
            'imageGeneratedUpdateProfile',
            'saveGeneratedImage',
            'triggerAuthChange',
            'signIn'
        ]);

        // Setup default spy behaviors
        supabaseService.ensureSessionLoaded.and.resolveTo(null);
        supabaseService.authChanges.and.callFake((callback) => {
            return { data: { subscription: {} as Subscription } };
        });

        await TestBed.configureTestingModule({
            imports: [
                LoginComponent,
                RouterTestingModule,
                MatToolbarModule,
                MatButtonModule,
                MatIconModule,
                MatMenuModule,
                MatDividerModule,
                BrowserAnimationsModule
            ],
            providers: [
                {
                    FormBuilder,
                    provide: SupabaseAuthService, useValue: supabaseService
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Validation', () => {
        it('should initialize with invalid form', () => {
            expect(component.loginForm.valid).toBeFalsy();
        });

        it('should have a valid form when email and password are provided', () => {
            component.loginForm.setValue({
                email: 'test@example.com',
                password: 'password123'
            });
            expect(component.loginForm.valid).toBeTrue();
        });

        it('should invalidate the email field with incorrect email format', () => {
            component.loginForm.controls['email'].setValue('not-an-email');
            expect(component.loginForm.controls['email'].valid).toBeFalse();
        });

        it('should validate the email field with a proper email', () => {
            component.loginForm.controls['email'].setValue('test@example.com');
            expect(component.loginForm.controls['email'].valid).toBeTrue();
        });

        it('should invalidate the form when password is missing', () => {
            component.loginForm.controls['email'].setValue('test@example.com');
            component.loginForm.controls['password'].setValue('');
            expect(component.loginForm.valid).toBeFalse();
        });

        it('should toggle password visibility', () => {
            const initial = component.hidePassword;
            component.hidePassword = !initial;
            expect(component.hidePassword).toBe(!initial);
        });
    });

    describe('Login Functionality', () => {
        it('should call signIn and navigate on successful login', fakeAsync(() => {
            const mockProfile = { id: '123', email: 'test@test.com', name: 'Test User', password: 'pass' };
            supabaseService.profile.and.resolveTo({
                data: mockProfile,
                error: null,
                count: null,
                status: 200,
                statusText: 'OK'
            });

            supabaseService.signIn.and.resolveTo({
                data: {
                    user: { id: '123', email: 'test@test.com' } as any,
                    session: {} as any,
                },
                error: null
            });

            const router = TestBed.inject(Router);
            spyOn(router, 'navigate');

            component.loginForm.setValue({ email: mockProfile.email, password: mockProfile.password });
            component.onSubmit();
            tick();

            expect(supabaseService.signIn).toHaveBeenCalled();
            expect(router.navigate).toHaveBeenCalledWith(['/']);
        }));

        it('should show an error message on failed login', fakeAsync(() => {
            const mockProfile = { email: 'test@test.com', password: 'wrongpassword' };

            const authError = new AuthError('Invalid credentials', 201, 'Invalid credentials');

            supabaseService.signIn.and.resolveTo({
                data: {
                    user: null,
                    session: null
                },
                error: authError
            });

            const router = TestBed.inject(Router);
            spyOn(router, 'navigate');

            component.loginForm.setValue({ email: mockProfile.email, password: mockProfile.password });
            component.onSubmit();
            tick();

            expect(supabaseService.signIn).toHaveBeenCalled();
            expect(router.navigate).not.toHaveBeenCalled();
            expect(component.errorMessage).toBe('Invalid credentials');
        }));
    });

});