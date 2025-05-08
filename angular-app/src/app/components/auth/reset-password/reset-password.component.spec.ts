import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
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

describe('ResetPasswordComponent', () => {
    let component: ResetPasswordComponent;
    let fixture: ComponentFixture<ResetPasswordComponent>;
    let supabaseService: jasmine.SpyObj<SupabaseAuthService>;

    beforeEach(async () => {
        supabaseService = jasmine.createSpyObj('SupabaseAuthService', [
            'resetPassword'
        ]);

        await TestBed.configureTestingModule({
            imports: [
                ResetPasswordComponent,
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

        fixture = TestBed.createComponent(ResetPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Validation', () => {
        it('should initialize with invalid form', () => {
            expect(component.resetForm.valid).toBeFalsy();
        });

        it('should have a valid form when email is provided', () => {
            component.resetForm.setValue({
                email: 'test@example.com'
            });
            expect(component.resetForm.valid).toBeTrue();
        });

        it('should invalidate the email field with incorrect email format', () => {
            component.resetForm.controls['email'].setValue('not-an-email');
            expect(component.resetForm.controls['email'].valid).toBeFalse();
        });

        it('should validate the email field with proper email', () => {
            component.resetForm.controls['email'].setValue('test@example.com');
            expect(component.resetForm.controls['email'].valid).toBeTrue();
        });
    });

    describe('Password Reset Functionality', () => {
        it('should call resetPassword and show success message on successful reset', fakeAsync(() => {
            const testEmail = 'test@example.com';
            supabaseService.resetPassword.and.resolveTo({ data: {}, error: null });

            component.resetForm.setValue({ email: testEmail });
            component.onSubmit();
            tick();

            expect(supabaseService.resetPassword).toHaveBeenCalledWith(testEmail);
            expect(component.successMessage).toContain('Password reset instructions have been sent');
            expect(component.errorMessage).toBe('');
            expect(component.isLoading).toBeFalse();
        }));

        it('should show error message on reset failure', fakeAsync(() => {
            const testEmail = 'test@example.com';
            const authError = new AuthError('Invalid credentials', 201, 'Invalid credentials');

            supabaseService.resetPassword.and.rejectWith(authError);

            component.resetForm.setValue({ email: testEmail });
            component.onSubmit();
            tick();

            expect(supabaseService.resetPassword).toHaveBeenCalledWith(testEmail);
            expect(component.errorMessage).toBe('Invalid credentials');
            expect(component.successMessage).toBe('');
            expect(component.isLoading).toBeFalse();
        }));
    });

    describe('UI Elements', () => {
        it('should display title and subtitle', () => {
            const titleElement = fixture.debugElement.query(By.css('mat-card-title'));
            const subtitleElement = fixture.debugElement.query(By.css('mat-card-subtitle'));

            expect(titleElement.nativeElement.textContent).toContain('Reset Password');
            expect(subtitleElement.nativeElement.textContent).toContain('Enter your email');
        });

        it('should disable submit button when form is invalid', () => {
            const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
            expect(submitButton.nativeElement.disabled).toBeTrue();

            component.resetForm.setValue({ email: 'test@example.com' });
            fixture.detectChanges();

            expect(submitButton.nativeElement.disabled).toBeFalse();
        });

        it('should have login link', () => {
            const loginLink = fixture.debugElement.query(By.css('a[routerLink="/login"]'));
            expect(loginLink).toBeTruthy();
            expect(loginLink.nativeElement.textContent).toContain('Sign in');
        });

        it('should show loading text while submitting', () => {
            component.isLoading = true;
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('button[type="submit"]'));

            const loadingSpan = button.query(By.css('span.text-white.font-medium'));

            expect(loadingSpan).toBeTruthy();
            expect(loadingSpan.nativeElement.textContent).toContain('Sending link...');
        });
    });
});