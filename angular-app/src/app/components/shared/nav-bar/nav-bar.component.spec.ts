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

describe('NavBarComponent', () => {
    let component: NavBarComponent;
    let fixture: ComponentFixture<NavBarComponent>;

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
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('UI Elements', () => {
        it('should show application name/logo', () => {
            const logoElement = fixture.debugElement.query(By.css('.text-purple-400'));
            expect(logoElement.nativeElement.textContent).toContain('AFluxGen');
        });

        it('should show navigation links when user is logged in', () => {
            component.profile = { id: '123', email: 'test@test.com', credits: 50 };
            fixture.detectChanges();

            const galleryButton = fixture.debugElement.query(By.css('button[routerLink="/gallery"]'));
            const generateButton = fixture.debugElement.query(By.css('button[routerLink="/generate"]'));
            const creditsButton = fixture.debugElement.query(By.css('button[routerLink="/upgrade"]'));

            expect(galleryButton).toBeTruthy();
            expect(generateButton).toBeTruthy();
            expect(creditsButton).toBeTruthy();
        });

        it('should hide navigation links when user is not logged in', () => {
            component.profile = null;
            fixture.detectChanges();

            const galleryButton = fixture.debugElement.query(By.css('button[routerLink="/gallery"]'));
            const generateButton = fixture.debugElement.query(By.css('button[routerLink="/generate"]'));
            const creditsButton = fixture.debugElement.query(By.css('button[routerLink="/upgrade"]'));

            expect(galleryButton).toBeNull();
            expect(generateButton).toBeNull();
            expect(creditsButton).toBeNull();
        });

        it('should display user credits when logged in', () => {
            component.profile = { credits: 100 };
            fixture.detectChanges();

            const creditsElement = fixture.debugElement.query(By.css('.bg-gray-700'));
            expect(creditsElement.nativeElement.textContent).toContain('100 credits');
        });
    });

    describe('User Interactions', () => {
        it('should emit signOut event when sign out is clicked', () => {
            spyOn(component.signOut, 'emit');
            component.signOutClicked();
            expect(component.signOut.emit).toHaveBeenCalled();
        });

        it('should show logged-in menu options when user is authenticated', fakeAsync(() => {
            component.profile = { id: '123', email: 'test@test.com' };
            fixture.detectChanges();
          
            const menuTriggerDebugEl = fixture.debugElement.query(By.directive(MatMenuTrigger));
            const menuTrigger = menuTriggerDebugEl.injector.get(MatMenuTrigger);
            menuTrigger.openMenu();
            fixture.detectChanges();
            tick();
          
            const overlayContainer = document.querySelector('.cdk-overlay-container');
          
            const accountDetailsButton = overlayContainer?.querySelector('button[routerLink="/account-details"]');
            const purchaseHistoryButton = overlayContainer?.querySelector('button[routerLink="/order-history"]');
            const signOutButton = Array.from(overlayContainer?.querySelectorAll('button') || [])
              .find(btn => btn.textContent?.includes('Sign out'));
          
            expect(accountDetailsButton).toBeTruthy();
            expect(purchaseHistoryButton).toBeTruthy();
            expect(signOutButton).toBeTruthy();

            const loginButton = overlayContainer?.querySelector('button[routerLink="/login"]');
            const signupButton = overlayContainer?.querySelector('button[routerLink="/signup"]');
          
            expect(loginButton).toBeNull();
            expect(signupButton).toBeNull();
          }));

        it('should show logged-out menu options when user is not authenticated', fakeAsync(() => {
            component.profile = null;
            fixture.detectChanges();

            const menuTriggerDebugEl = fixture.debugElement.query(By.directive(MatMenuTrigger));
            const menuTrigger = menuTriggerDebugEl.injector.get(MatMenuTrigger);
            menuTrigger.openMenu();
            fixture.detectChanges();
            tick();
          
            const overlayContainer = document.querySelector('.cdk-overlay-container');
          
            const loginButton = overlayContainer?.querySelector('button[routerLink="/login"]');
            const signupButton = overlayContainer?.querySelector('button[routerLink="/signup"]');
          
            expect(loginButton).toBeTruthy();
            expect(signupButton).toBeTruthy();

            const accountDetailsButton = overlayContainer?.querySelector('button[routerLink="/account-details"]');
            const purchaseHistoryButton = overlayContainer?.querySelector('button[routerLink="/order-history"]');
            const signOutButton = Array.from(overlayContainer?.querySelectorAll('button') || [])
              .find(btn => btn.textContent?.includes('Sign out'));
          
            expect(accountDetailsButton).toBeNull();
            expect(purchaseHistoryButton).toBeNull();
            expect(signOutButton).toBeUndefined();
        }));
    });
});