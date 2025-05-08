import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UpgradeComponent } from './upgrade.component';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { StripeService } from '../../services/stripe.service';
import { PaymentService } from '../../services/payment.service';
import { ConfigService } from '../../services/config.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/postgrest-js';
import { CREDIT_PACKAGES } from '../shared/credit-packages';

import { NavigationService } from '../../services/navigation.service';


describe('UpgradeComponent', () => {
    let component: UpgradeComponent;
    let fixture: ComponentFixture<UpgradeComponent>;
    let supabaseService: jasmine.SpyObj<SupabaseAuthService>;
    let stripeService: jasmine.SpyObj<StripeService>;
    let paymentService: jasmine.SpyObj<PaymentService>;
    let configService: jasmine.SpyObj<ConfigService>;
    let navigationService: jasmine.SpyObj<NavigationService>;

    beforeEach(async () => {
        supabaseService = jasmine.createSpyObj('SupabaseAuthService', [
            'fluxProfile',
            'ensureSessionLoaded',
            'authChanges',
            'saveTokenTracker'
        ]);

        stripeService = jasmine.createSpyObj('StripeService', [], {
            creditPackages: CREDIT_PACKAGES
        });

        paymentService = jasmine.createSpyObj('PaymentService', ['setApiCallMade']);

        navigationService = jasmine.createSpyObj('NavigationService', ['navigateTo']);

        configService = jasmine.createSpyObj('ConfigService', [], {
            stripeBasicUrl: 'test-basic-url',
            stripeStandardUrl: 'test-standard-url',
            stripePremiumUrl: 'test-premium-url'
        });

        supabaseService.ensureSessionLoaded.and.resolveTo({
            access_token: 'test-token',
            refresh_token: 'test-refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: { id: '123', email: 'test@test.com' } as any
        } as Session);

        supabaseService.authChanges.and.callFake((callback) => {
            return { data: { subscription: {} as Subscription } };
        });

        supabaseService.saveTokenTracker.and.resolveTo({
            data: null,
            error: null,
            count: null,
            status: 200,
            statusText: 'OK'
        });

        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                BrowserAnimationsModule,
                MatButtonModule,
                MatIconModule,
                MatCardModule,
                MatDividerModule,
                MatProgressSpinnerModule
            ],
            providers: [
                { provide: SupabaseAuthService, useValue: supabaseService },
                { provide: StripeService, useValue: stripeService },
                { provide: PaymentService, useValue: paymentService },
                { provide: ConfigService, useValue: configService },
                { provide: NavigationService, useValue: navigationService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(UpgradeComponent);
        component = fixture.componentInstance;
        component['navigationService'] = navigationService;

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        const testSession: Session = {
            access_token: 'test-token',
            refresh_token: 'test-refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: { id: '123', email: 'test@test.com' } as any
        };

        it('should set credit packages from stripeService', fakeAsync(() => {
            component.ngOnInit();
            tick();
            expect(component.creditPackages).toEqual(CREDIT_PACKAGES);
        }));

        it('should get profile if session exists', fakeAsync(() => {
            supabaseService.ensureSessionLoaded.and.resolveTo(testSession);
            const mockProfile = { id: '123', email: 'test@test.com' };
            supabaseService.fluxProfile.and.resolveTo({
                data: mockProfile,
                error: null,
                count: null,
                status: 200,
                statusText: 'OK'
            });

            component.ngOnInit();
            tick();

            expect(component.profile).toEqual(mockProfile);
        }));
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
            expect(component.userEmail).toEqual('');
        }));
    });

    describe('purchaseCredits', () => {
        const mockConfig = jasmine.createSpyObj('ConfigService', [], {
            stripeBasicUrl: 'https://stripe.com/basic',
            stripeStandardUrl: 'https://stripe.com/standard',
            stripePremiumUrl: 'https://stripe.com/premium'
        });

        beforeEach(() => {
            component.profile = { id: '123', email: 'test@test.com' };
            component['config'] = mockConfig;
        });

        it('should handle basic package purchase', fakeAsync(() => {
            const packageId = 'basic';
          
            component.purchaseCredits(packageId);
            tick();
          
            expect(supabaseService.saveTokenTracker).toHaveBeenCalled();
            expect(paymentService.setApiCallMade).toHaveBeenCalledWith(true);
            expect(navigationService.navigateTo).toHaveBeenCalledWith(mockConfig.stripeBasicUrl);
        }));

        it('should handle standard package purchase', fakeAsync(() => {
            const packageId = 'standard';
          
            component.purchaseCredits(packageId);
            tick();
          
            expect(supabaseService.saveTokenTracker).toHaveBeenCalled();
            expect(paymentService.setApiCallMade).toHaveBeenCalledWith(true);
            expect(navigationService.navigateTo).toHaveBeenCalledWith(mockConfig.stripeStandardUrl);
        }));

        it('should handle premium package purchase', fakeAsync(() => {
            const packageId = 'premium';
          
            component.purchaseCredits(packageId);
            tick();
          
            expect(supabaseService.saveTokenTracker).toHaveBeenCalled();
            expect(paymentService.setApiCallMade).toHaveBeenCalledWith(true);
            expect(navigationService.navigateTo).toHaveBeenCalledWith(mockConfig.stripePremiumUrl);
        }));
    });
});