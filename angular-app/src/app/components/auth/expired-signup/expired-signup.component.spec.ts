import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

import { ExpiredSignupComponent } from './expired-signup.component';
import { SupabaseAuthService } from '../../../services/supabase-auth.service';
import { AuthDataService } from '../../../services/auth-data.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface MockAuthResponse {
  data: any;
  error: any;
}

describe('ExpiredSignupComponent', () => {
  let component: ExpiredSignupComponent;
  let fixture: ComponentFixture<ExpiredSignupComponent>;
  let supabaseAuthServiceSpy: jasmine.SpyObj<SupabaseAuthService>;
  let authDataServiceSpy: jasmine.SpyObj<AuthDataService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  
  const setEmailValue = (email: string) => {
    component.expiredForm.get('email')?.setValue(email);
    component.expiredForm.get('email')?.markAsTouched();
    fixture.detectChanges();
  };

  const makeFormInvalid = () => {
    setEmailValue('invalid-email');
  };

  const makeFormValid = () => {
    setEmailValue('valid@example.com');
  };

  beforeEach(async () => {
    // Create spies for the services
    supabaseAuthServiceSpy = jasmine.createSpyObj('SupabaseAuthService', ['resendSignUp']);
    authDataServiceSpy = jasmine.createSpyObj('AuthDataService', ['setSignupEmail']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    
    await TestBed.configureTestingModule({
      declarations: [ExpiredSignupComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatSnackBarModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: SupabaseAuthService, useValue: supabaseAuthServiceSpy },
        { provide: AuthDataService, useValue: authDataServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            fragment: of(null)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpiredSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with an empty form', () => {
    expect(component.expiredForm).toBeDefined();
    expect(component.expiredForm.get('email')?.value).toBe('');
    expect(component.expiredForm.valid).toBeFalsy();
  });

  it('should validate email format', () => {
    setEmailValue('invalid-email');
    expect(component.expiredForm.get('email')?.valid).toBeFalsy();
    expect(component.expiredForm.get('email')?.hasError('email')).toBeTruthy();

    setEmailValue('');
    expect(component.expiredForm.get('email')?.valid).toBeFalsy();
    expect(component.expiredForm.get('email')?.hasError('required')).toBeTruthy();

    setEmailValue('valid@example.com');
    expect(component.expiredForm.get('email')?.valid).toBeTruthy();
  });

  it('should disable the submit button when form is invalid', () => {
    makeFormInvalid();
    fixture.detectChanges();
    const form = fixture.debugElement.query(By.css('form'));
    const submitButton = form.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBeTruthy();
  });

  it('should enable the submit button when form is valid', () => {
    makeFormValid();
    fixture.detectChanges();
    const form = fixture.debugElement.query(By.css('form'));
    const submitButton = form.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBeFalsy();
  });

  it('should process URL fragment with expired error code correctly', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [ExpiredSignupComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatSnackBarModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: SupabaseAuthService, useValue: supabaseAuthServiceSpy },
        { provide: AuthDataService, useValue: authDataServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            fragment: of('error_code=otp_expired&email=test@example.com')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpiredSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Your verification link has expired.');
    expect(component.expiredForm.get('email')?.value).toBe('test@example.com');
  });

  it('should process URL fragment with other error description correctly', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [ExpiredSignupComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatSnackBarModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: SupabaseAuthService, useValue: supabaseAuthServiceSpy },
        { provide: AuthDataService, useValue: authDataServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            fragment: of('error_description=Custom+error+message')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpiredSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Custom error message');
  });

  it('should show validation messages when submitting invalid form', () => {
    setEmailValue('');
    component.onSubmit();
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('form'));
    const errorMessage = form.query(By.css('mat-error'));
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.nativeElement.textContent).toContain('Email is required');
  });

  it('should call resendSignUp service when form is submitted with valid data', fakeAsync(() => {
    const testEmail = 'test@example.com';
    const successResponse: MockAuthResponse = { 
      data: { user: null, session: null },
      error: null 
    };
    supabaseAuthServiceSpy.resendSignUp.and.returnValue(Promise.resolve(successResponse as any));
    
    setEmailValue(testEmail);
    component.onSubmit();
    
    expect(component.isResending).toBeTruthy();
    
    tick(); // Resolve the Promise
    
    expect(supabaseAuthServiceSpy.resendSignUp).toHaveBeenCalledWith(testEmail);
    expect(component.isResending).toBeFalsy();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Verification email resent successfully!',
      'Close',
      jasmine.any(Object)
    );
    expect(authDataServiceSpy.setSignupEmail).toHaveBeenCalledWith(testEmail);
  }));

  it('should handle error from resendSignUp service', fakeAsync(() => {
    const testEmail = 'test@example.com';
    const errorMessage = 'Service error message';
    const errorResponse: MockAuthResponse = { 
      data: null, 
      error: { message: errorMessage } 
    };
    supabaseAuthServiceSpy.resendSignUp.and.returnValue(Promise.resolve(errorResponse as any));
    
    setEmailValue(testEmail);
    component.onSubmit();
    
    expect(component.isResending).toBeTruthy();
    
    tick(); // Resolve the Promise
    
    expect(supabaseAuthServiceSpy.resendSignUp).toHaveBeenCalledWith(testEmail);
    expect(component.isResending).toBeFalsy();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      errorMessage,
      'Close',
      jasmine.objectContaining({ panelClass: ['error-snackbar'] })
    );
  }));

  it('should handle exception from resendSignUp service', fakeAsync(() => {
    const testEmail = 'test@example.com';
    const exceptionMessage = 'Network error';
    supabaseAuthServiceSpy.resendSignUp.and.returnValue(Promise.reject(new Error(exceptionMessage)));
    
    setEmailValue(testEmail);
    component.onSubmit();
    
    expect(component.isResending).toBeTruthy();
    
    tick();
    
    expect(supabaseAuthServiceSpy.resendSignUp).toHaveBeenCalledWith(testEmail);
    expect(component.isResending).toBeFalsy();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Failed to resend email: Network error',
      'Close',
      jasmine.objectContaining({ panelClass: ['error-snackbar'] })
    );
  }));

  it('should show loading indicator when resending', () => {
    makeFormValid();
    
    // Setup the spy to return a promise that won't resolve during this test
    supabaseAuthServiceSpy.resendSignUp.and.returnValue(new Promise(() => {}));
    
    component.onSubmit();
    fixture.detectChanges();
    
    expect(component.isResending).toBeTruthy();
    
    const form = fixture.debugElement.query(By.css('form'));
    const spinnerElement = form.query(By.css('.animate-spin'));
    const loadingText = form.query(By.css('.submit-span-spec-test'));
    
    expect(spinnerElement).toBeTruthy();
    expect(loadingText).toBeTruthy();
    expect(loadingText.nativeElement.textContent).toContain('Resending...');
  });
}); 