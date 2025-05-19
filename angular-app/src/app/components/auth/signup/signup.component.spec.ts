import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SupabaseAuthService } from '../../../services/supabase-auth.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { AuthError } from '@supabase/supabase-js';

describe('SignupComponent', () => {
    let component: SignupComponent;
    let fixture: ComponentFixture<SignupComponent>;
    let supabaseService: jasmine.SpyObj<SupabaseAuthService>;
    let router: Router;

    beforeEach(async () => {
        supabaseService = jasmine.createSpyObj('SupabaseAuthService', [
            'signUp'
        ]);

        await TestBed.configureTestingModule({
            declarations: [SignupComponent],
            imports: [
                RouterTestingModule,
                MatInputModule,
                MatButtonModule,
                MatFormFieldModule,
                MatCardModule,
                MatIconModule,
                BrowserAnimationsModule,
                ReactiveFormsModule
            ],
            providers: [
                FormBuilder,
                { provide: SupabaseAuthService, useValue: supabaseService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SignupComponent);
        router = TestBed.inject(Router);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Validation', () => {
        it('should initialize with invalid form', () => {
            expect(component.signupForm.valid).toBeFalsy();
        });

        it('should have a valid form when all fields are properly filled', () => {
            component.signupForm.setValue({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            });
            expect(component.signupForm.valid).toBeTrue();
        });

        it('should invalidate the email field with incorrect email format', () => {
            component.signupForm.controls['email'].setValue('not-an-email');
            expect(component.signupForm.controls['email'].valid).toBeFalse();
        });

        it('should validate the email field with proper email', () => {
            component.signupForm.controls['email'].setValue('test@example.com');
            expect(component.signupForm.controls['email'].valid).toBeTrue();
        });

        it('should invalidate password field when less than 6 characters', () => {
            component.signupForm.controls['password'].setValue('12345');
            expect(component.signupForm.controls['password'].valid).toBeFalse();
        });

        it('should validate password field when 6 or more characters', () => {
            component.signupForm.controls['password'].setValue('123456');
            expect(component.signupForm.controls['password'].valid).toBeTrue();
        });
    });

    describe('Password Matching', () => {
        it('should invalidate form when passwords do not match', () => {
            component.signupForm.setValue({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password456'
            });
            expect(component.signupForm.hasError('passwordMismatch')).toBeFalse();
            expect(component.signupForm.get('confirmPassword')?.hasError('passwordMismatch')).toBeTrue();
        });

        it('should validate form when passwords match', () => {
            component.signupForm.setValue({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            });
            expect(component.signupForm.get('confirmPassword')?.hasError('passwordMismatch')).toBeFalse();
        });
    });

    describe('Password Visibility', () => {
        it('should toggle password visibility', () => {
            const initial = component.hidePassword;
            component.hidePassword = !initial;
            expect(component.hidePassword).toBe(!initial);
        });

        it('should toggle confirm password visibility', () => {
            const initial = component.hideConfirmPassword;
            component.hideConfirmPassword = !initial;
            expect(component.hideConfirmPassword).toBe(!initial);
        });
    });

    describe('Signup Functionality', () => {
        it('should call signUp and navigate to post-signup on success', fakeAsync(() => {
            const testEmail = 'test@example.com';
            const testPassword = 'password123';

            supabaseService.signUp.and.resolveTo({
                data: {
                    user: { id: '123', email: 'test@test.com' } as any,
                    session: {} as any,
                },
                error: null
            });

            component.signupForm.setValue({
                email: testEmail,
                password: testPassword,
                confirmPassword: testPassword
            });

            spyOn(router, 'navigate');

            component.onSubmit();
            tick();

            expect(supabaseService.signUp).toHaveBeenCalledWith(testEmail, testPassword);
            expect(router.navigate).toHaveBeenCalledWith(['/auth/post-signup']);
            expect(component.errorMessage).toBe('');
            expect(component.isLoading).toBeFalse();
        }));

        it('should show error message on signup failure', fakeAsync(() => {
            const testEmail = 'test@example.com';
            const testPassword = 'password123';

            const error = new AuthError('Signup failed', 400, 'Signup failed');
            supabaseService.signUp.and.rejectWith(error);

            component.signupForm.setValue({
                email: testEmail,
                password: testPassword,
                confirmPassword: testPassword
            });

            spyOn(router, 'navigate');

            component.onSubmit();
            tick();

            expect(supabaseService.signUp).toHaveBeenCalledWith(testEmail, testPassword);
            expect(router.navigate).not.toHaveBeenCalled();
            expect(component.errorMessage).toBe('Signup failed');
            expect(component.isLoading).toBeFalse();
        }));
    });

    describe('UI Elements', () => {
        it('should display title and subtitle', () => {
            const titleElement = fixture.debugElement.query(By.css('h2.text-2xl'));
            const subtitleElement = fixture.debugElement.query(By.css('p.text-sm'));

            expect(titleElement.nativeElement.textContent).toContain('Create your account');
            expect(subtitleElement.nativeElement.textContent).toContain('Join our community and start creating amazing AI-generated images');
        });

        it('should disable submit button when form is invalid', () => {
            const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
            expect(submitButton.nativeElement.disabled).toBeTrue();

            component.signupForm.setValue({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            });
            fixture.detectChanges();

            expect(submitButton.nativeElement.disabled).toBeFalse();
        });

        it('should have login link', () => {
            const loginLink = fixture.debugElement.query(By.css('a[routerLink="/auth/login"]'));
            expect(loginLink).toBeTruthy();
            expect(loginLink.nativeElement.textContent).toContain('Sign in');
        });

        it('should show loading text while submitting', () => {
            component.isLoading = true;
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button[type="submit"]'));

            const loadingSpan = button.query(By.css('span.submit-span-spec-test'));
            
            expect(loadingSpan).toBeTruthy();
            expect(loadingSpan.nativeElement.textContent).toContain('Creating account...');
        });
    });
});