import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UpdatePasswordComponent } from './update-password.component';
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

describe('UpdatePasswordComponent', () => {
  let component: UpdatePasswordComponent;
  let fixture: ComponentFixture<UpdatePasswordComponent>;
  let supabaseService: jasmine.SpyObj<SupabaseAuthService>;
  let router: Router;

  beforeEach(async () => {
    supabaseService = jasmine.createSpyObj('SupabaseAuthService', [
      'updatePassword'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        UpdatePasswordComponent,
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

    fixture = TestBed.createComponent(UpdatePasswordComponent);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should initialize with invalid form', () => {
      expect(component.updateForm.valid).toBeFalsy();
    });

    it('should have a valid form when passwords match and meet requirements', () => {
      component.updateForm.setValue({
        newPassword: 'password123',
        confirmPassword: 'password123'
      });
      expect(component.updateForm.valid).toBeTrue();
    });

    it('should invalidate password field when less than 8 characters', () => {
      component.updateForm.controls['newPassword'].setValue('1234567');
      expect(component.updateForm.controls['newPassword'].hasError('minlength')).toBeTrue();
    });

    it('should invalidate password field when more than 30 characters', () => {
      component.updateForm.controls['newPassword'].setValue('a'.repeat(31));
      expect(component.updateForm.controls['newPassword'].hasError('maxlength')).toBeTrue();
    });

    it('should validate password field when length is between 8 and 30 characters', () => {
      component.updateForm.controls['newPassword'].setValue('password123');
      expect(component.updateForm.controls['newPassword'].valid).toBeTrue();
    });
  });

  describe('Password Matching', () => {
    it('should invalidate form when passwords do not match', () => {
      component.updateForm.setValue({
        newPassword: 'password123',
        confirmPassword: 'password456'
      });
      expect(component.updateForm.hasError('passwordMismatch')).toBeTrue();
    });

    it('should validate form when passwords match', () => {
      component.updateForm.setValue({
        newPassword: 'password123',
        confirmPassword: 'password123'
      });
      expect(component.updateForm.hasError('passwordMismatch')).toBeFalse();
    });

    it('should clear password mismatch error when passwords are made to match', () => {
      // First set mismatching passwords
      component.updateForm.setValue({
        newPassword: 'password123',
        confirmPassword: 'password456'
      });
      expect(component.updateForm.get('confirmPassword')?.hasError('passwordMismatch')).toBeTrue();

      // Then make them match
      component.updateForm.patchValue({
        confirmPassword: 'password123'
      });
      expect(component.updateForm.get('confirmPassword')?.hasError('passwordMismatch')).toBeFalse();
    });
  });

  describe('Password Update Functionality', () => {
    it('should call updatePassword and show success message on successful update', fakeAsync(() => {
      const newPassword = 'newPassword123';

      supabaseService.updatePassword.and.resolveTo({
        data: {
          user: { id: '123', email: 'test@test.com' } as any
        },
        error: null
      });

      component.updateForm.setValue({
        newPassword: newPassword,
        confirmPassword: newPassword
      });

      component.onSubmit();
      tick();

      expect(supabaseService.updatePassword).toHaveBeenCalledWith(newPassword);
      expect(component.successMessage).toContain('Password has been reset successfully');
      expect(component.errorMessage).toBe('');
      expect(component.isLoading).toBeFalse();
      expect(component.passwordUpdated).toBeTrue();
    }));

    it('should show error message on update failure', fakeAsync(() => {
      const newPassword = 'newPassword123';

      const error = new AuthError('Update failed', 400, 'Update failed');

      supabaseService.updatePassword.and.rejectWith(error);

      component.updateForm.setValue({
        newPassword: newPassword,
        confirmPassword: newPassword
      });

      component.onSubmit();
      tick();

      expect(supabaseService.updatePassword).toHaveBeenCalledWith(newPassword);
      expect(component.errorMessage).toBe('Update failed');
      expect(component.successMessage).toBe('');
      expect(component.isLoading).toBeFalse();
      expect(component.passwordUpdated).toBeFalse();
    }));
  });

  describe('UI Elements', () => {
    it('should display title', () => {
      const titleElement = fixture.debugElement.query(By.css('mat-card-title'));
      expect(titleElement.nativeElement.textContent).toContain('Update Password');
    });

    it('should disable submit button when form is invalid', () => {
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeTrue();

      component.updateForm.setValue({
        newPassword: 'password123',
        confirmPassword: 'password123'
      });
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
      expect(loadingSpan.nativeElement.textContent).toContain('Updating Password...');
    });

    it('should hide password fields and sign in link after successful update', () => {
      component.passwordUpdated = true;
      fixture.detectChanges();

      const passwordFields = fixture.debugElement.queryAll(By.css('mat-form-field'));
      const signInLink = fixture.debugElement.query(By.css('mat-card-actions'));

      expect(passwordFields.length).toBe(0);
      expect(signInLink).toBeNull();
    });
  });

});