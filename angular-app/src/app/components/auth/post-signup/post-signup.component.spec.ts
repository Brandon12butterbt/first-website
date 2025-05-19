import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostSignupComponent } from './post-signup.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { SupabaseAuthService } from '../../../services/supabase-auth.service';

describe('PostSignupComponent', () => {
  let component: PostSignupComponent;
  let fixture: ComponentFixture<PostSignupComponent>;
  let supabaseService: jasmine.SpyObj<SupabaseAuthService>;
  let router: Router;

  beforeEach(async () => {
    supabaseService = jasmine.createSpyObj('SupabaseAuthService', [
      'resendSignUp'
    ]);

    await TestBed.configureTestingModule({
      declarations: [PostSignupComponent],
      imports: [
        RouterTestingModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule
      ],
      providers: [
        { provide: SupabaseAuthService, useValue: supabaseService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostSignupComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('UI Elements', () => {
    it('should display verification message', () => {
      const titleElement = fixture.debugElement.query(By.css('h2'));
      const messageElement = fixture.debugElement.query(By.css('p'));

      expect(titleElement.nativeElement.textContent).toContain('Verify Your Email');
      expect(messageElement.nativeElement.textContent).toContain('One more step to complete your registration');
    });

    it('should show email icon', () => {
      const iconElement = fixture.debugElement.query(By.css('mat-icon'));
      expect(iconElement.nativeElement.textContent).toContain('mark_email_read');
    });

    it('should have login button with correct link', () => {
      const button = fixture.debugElement.query(By.css('button[routerLink="/auth/login"]'));
      
      expect(button).toBeTruthy();
      expect(button.nativeElement.textContent).toContain('Go to Login');
    });
  });

  describe('Styling', () => {
    it('should have correct layout classes', () => {
      const container = fixture.debugElement.query(By.css('div.bg-gray-900'));    
      expect(container).toBeTruthy();
    });
  });
});