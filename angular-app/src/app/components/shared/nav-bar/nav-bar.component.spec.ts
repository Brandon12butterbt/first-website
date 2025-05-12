import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { NavBarComponent } from './nav-bar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MatMenuTrigger } from '@angular/material/menu';
import { DebugElement } from '@angular/core';

describe('NavBarComponent', () => {
    let component: NavBarComponent;
    let fixture: ComponentFixture<NavBarComponent>;
    let debugElement: DebugElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NavBarComponent,
                RouterTestingModule,
                MatToolbarModule,
                MatButtonModule,
                MatIconModule,
                MatMenuModule,
                MatDividerModule,
                BrowserAnimationsModule
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(NavBarComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
      });
    
      it('should display logo with correct text', () => {
        const logo = debugElement.query(By.css('a[routerLink="/"]'));
        expect(logo.nativeElement.textContent).toContain('AFluxGen');
      });
    
      describe('when user is not authenticated', () => {
        beforeEach(() => {
          component.profile = null;
          fixture.detectChanges();
        });
    
        it('should show home link for guests', () => {
          const homeLink = debugElement.query(By.css('a[routerLink="/"]'));
          expect(homeLink).toBeTruthy();
        });
    
        it('should show login and signup links', () => {
          const loginLink = debugElement.query(By.css('a[routerLink="/auth/login"]'));
          const signupLink = debugElement.query(By.css('a[routerLink="/auth/signup"]'));
          expect(loginLink).toBeTruthy();
          expect(signupLink).toBeTruthy();
        });
    
        it('should not show gallery, generate or upgrade links', () => {
          const galleryLink = debugElement.query(By.css('a[routerLink="/gallery"]'));
          const generateLink = debugElement.query(By.css('a[routerLink="/generate"]'));
          const upgradeLink = debugElement.query(By.css('a[routerLink="/upgrade"]'));
          expect(galleryLink).toBeFalsy();
          expect(generateLink).toBeFalsy();
          expect(upgradeLink).toBeFalsy();
        });
    
        it('should not show credits badge', () => {
          const creditsBadge = debugElement.query(By.css('.bg-gray-800'));
          expect(creditsBadge).toBeFalsy();
        });
      });
    
      describe('when user is authenticated', () => {
        beforeEach(() => {
          component.profile = { credits: 100 };
          component.userEmail = 'test@example.com';
          fixture.detectChanges();
        });
    
        it('should show gallery, generate and upgrade links', () => {
          const galleryLink = debugElement.query(By.css('a[routerLink="/gallery"]'));
          const generateLink = debugElement.query(By.css('a[routerLink="/generate"]'));
          const upgradeLink = debugElement.query(By.css('a[routerLink="/upgrade"]'));
          expect(galleryLink).toBeTruthy();
          expect(generateLink).toBeTruthy();
          expect(upgradeLink).toBeTruthy();
        });
    
        it('should show credits badge with correct value', () => {
          const creditsBadge = debugElement.query(By.css('.bg-gray-800'));
          expect(creditsBadge.nativeElement.textContent).toContain('100 credits');
        });
    
        it('should show user email in dropdown button', () => {
          const dropdownButton = debugElement.query(By.css('button'));
          expect(dropdownButton.nativeElement.textContent).toContain('test@example.com');
        });
    
        it('should toggle user dropdown when clicked', () => {
          const dropdownButton = debugElement.query(By.css('button'));
          expect(component.isUserDropdownOpen).toBeFalse();
          
          dropdownButton.triggerEventHandler('click', { stopPropagation: () => {} });
          fixture.detectChanges();
          
          expect(component.isUserDropdownOpen).toBeTrue();
          
          dropdownButton.triggerEventHandler('click', { stopPropagation: () => {} });
          fixture.detectChanges();
          
          expect(component.isUserDropdownOpen).toBeFalse();
        });
    
        it('should show dropdown menu when toggled', () => {
          component.isUserDropdownOpen = true;
          fixture.detectChanges();
          
          const dropdownMenu = debugElement.query(By.css('.absolute.right-0'));
          expect(dropdownMenu).toBeTruthy();
        });
    
        it('should emit signOut event when sign out is clicked', () => {
          spyOn(component.signOut, 'emit');
          component.isUserDropdownOpen = true;
          fixture.detectChanges();
          
          const signOutButton = debugElement.query(By.css('button[class*="w-full"]'));
          signOutButton.triggerEventHandler('click', null);
          
          expect(component.signOut.emit).toHaveBeenCalled();
        });
    
        it('should close dropdown when mouse leaves', fakeAsync(() => {
          component.isUserDropdownOpen = true;
          fixture.detectChanges();
          
          const dropdownMenu = debugElement.query(By.css('.absolute.right-0'));
          dropdownMenu.triggerEventHandler('mouseleave', null);
          tick();
          
          expect(component.isUserDropdownOpen).toBeFalse();
        }));
      });
    
      describe('mobile menu', () => {
        it('should show mobile menu when toggled', () => {
          component.isMobileMenuOpen = true;
          fixture.detectChanges();
          
          const mobileMenu = debugElement.query(By.css('.bg-gray-800'));
          expect(mobileMenu).toBeTruthy();
        });
    
        it('should close all menus when closeAllMenus is called', () => {
          component.isMobileMenuOpen = true;
          component.isUserDropdownOpen = true;
          
          component.closeAllMenus();
          
          expect(component.isMobileMenuOpen).toBeFalse();
          expect(component.isUserDropdownOpen).toBeFalse();
        });
    
        it('should close menus when escape key is pressed', () => {
          component.isMobileMenuOpen = true;
          component.isUserDropdownOpen = true;
          
          const event = new KeyboardEvent('keydown', { key: 'Escape' });
          document.dispatchEvent(event);
          
          expect(component.isMobileMenuOpen).toBeFalse();
          expect(component.isUserDropdownOpen).toBeFalse();
        });
      });
});