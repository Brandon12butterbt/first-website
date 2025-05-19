import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ContactComponent } from './contact.component';
import { ContactService } from '../../services/contact.service';
import { SupabaseAuthService } from '../../services/supabase-auth.service';


describe('ContactComponent', () => {
    let component: ContactComponent;
    let fixture: ComponentFixture<ContactComponent>;
    let contactServiceSpy: jasmine.SpyObj<ContactService>;
    let supabaseService: jasmine.SpyObj<SupabaseAuthService>;

    beforeEach(async () => {
        contactServiceSpy = jasmine.createSpyObj('ContactService', ['sendContactRequest']);
        supabaseService = jasmine.createSpyObj('SupabaseAuthService', ['ensureSessionLoaded', 'profile']);

        supabaseService.ensureSessionLoaded.and.resolveTo(null);

        await TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                NoopAnimationsModule,
                ContactComponent
            ],
            providers: [
                FormBuilder,
                { provide: ContactService, useValue: contactServiceSpy },
                { provide: SupabaseAuthService, useValue: supabaseService }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ContactComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the form with three controls', () => {
        expect(component.contactForm.contains('type')).toBeTruthy();
        expect(component.contactForm.contains('description')).toBeTruthy();
    });

    it('should mark form as invalid when empty', () => {
        expect(component.contactForm.valid).toBeFalsy();
    });

    it('should mark form as valid when all fields are filled correctly', () => {
        component.contactForm.controls['type'].setValue('general');
        component.contactForm.controls['description'].setValue('This is a test description that is more than 20 characters');
        component.contactForm.controls['email'].setValue('test@example.com');

        expect(component.contactForm.valid).toBeTruthy();
    });

    it('should not call sendContactRequest when form is invalid', () => {
        component.contactForm.controls['type'].setValue('');
        component.contactForm.controls['description'].setValue('');
        component.contactForm.controls['email'].setValue('');

        component.onSubmit();

        expect(contactServiceSpy.sendContactRequest).not.toHaveBeenCalled();
    });
}); 