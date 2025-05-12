import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostSignupComponent } from './post-signup.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('PostSignupComponent', () => {
  let component: PostSignupComponent;
  let fixture: ComponentFixture<PostSignupComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostSignupComponent],
      imports: [
        RouterTestingModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule
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
      expect(messageElement.nativeElement.textContent).toContain('Please check your email to confirm your account');
    });

    it('should show email icon', () => {
      const iconElement = fixture.debugElement.query(By.css('mat-icon'));
      expect(iconElement.nativeElement.textContent).toContain('mark_email_read');
      expect(iconElement.classes['text-green-500']).toBeTrue();
    });

    it('should have login button with correct link', () => {
      const button = fixture.debugElement.query(By.css('button[routerLink="/auth/login"]'));
      
      expect(button).toBeTruthy();
      expect(button.nativeElement.textContent).toContain('Go to Login');
    });
  });

  describe('Styling', () => {
    it('should have correct layout classes', () => {
      const container = fixture.debugElement.query(By.css('.h-\\[calc\\(100vh-60px\\)\\]'));
      const card = fixture.debugElement.query(By.css('mat-card'));
      
      expect(container).toBeTruthy();
      expect(card.classes['bg-gray-800']).toBeTrue();
      expect(card.classes['card-style']).toBeTrue();
    });
  });
});