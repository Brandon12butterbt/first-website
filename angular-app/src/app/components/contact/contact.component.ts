import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { ContactService, ContactRequest } from '../../services/contact.service';
import { SupabaseAuthService } from '../../services/supabase-auth.service';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        RouterModule
    ],
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
    contactForm: FormGroup;
    isSubmitting = false;
    userEmail: string = '';
    profile: any = null;
    requestTypes = [
        { value: 'general', label: 'General Question' },
        { value: 'technical', label: 'Technical Support' },
        { value: 'billing', label: 'Billing Issue' },
        { value: 'feature', label: 'Feature Request' },
        { value: 'other', label: 'Other' }
    ];

    constructor(
        private fb: FormBuilder,
        private contactService: ContactService,
        private snackBar: MatSnackBar,
        private supabaseAuthService: SupabaseAuthService
    ) {
        this.contactForm = this.fb.group({
            type: ['', Validators.required],
            description: ['', [Validators.required, Validators.minLength(20)]],
            email: [{ value: '', disabled: true }, [Validators.required, Validators.email]]
        });
    }

    async ngOnInit(): Promise<void> {
        const session = await this.supabaseAuthService.ensureSessionLoaded();

        if (session) {
            this.getProfile(session).then(() => {
                if (this.profile) {
                    this.userEmail = this.profile.email;
                    this.contactForm.patchValue({
                        email: this.userEmail
                    });
                }
            });
        }

        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }

    async getProfile(session: any) {
        try {
            const { user } = session;
            const { data: profile, error, status } = await this.supabaseAuthService.profile(user);

            if (error && status !== 406) {
                throw error;
            }
            if (profile) {
                this.profile = profile;
            }
        } catch (error) {
            console.log(error);
        }
    }

    onSubmit(): void {
        console.log('1')
        if (this.contactForm.valid) {
            this.isSubmitting = true;
            console.log('2')
            const request: ContactRequest = {
                type: this.contactForm.value.type,
                description: this.contactForm.value.description,
                email: this.userEmail
            };

            this.contactService.sendContactRequest(request).subscribe({
                next: () => {
                    console.log('3')
                    this.isSubmitting = false;
                    this.snackBar.open('Your request has been submitted successfully!', 'Close', {
                        duration: 5000,
                        panelClass: ['success-snackbar']
                    });
                    console.log('3.1 just called snackbar')
                    this.contactForm.patchValue({
                        type: '',
                        description: ''
                    });
                },
                error: (error) => {
                    console.log('4')
                    this.isSubmitting = false;
                    this.snackBar.open('Failed to submit your request. Please try again.', 'Close', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    });
                    console.error('Error submitting contact form:', error);
                }
            });
        } else {
            console.log('5')
            this.markFormGroupTouched(this.contactForm);
        }
    }

    // Helper method to mark all controls as touched
    markFormGroupTouched(formGroup: FormGroup) {
        Object.values(formGroup.controls).forEach(control => {
            control.markAsTouched();
            if ((control as any).controls) {
                this.markFormGroupTouched(control as FormGroup);
            }
        });
    }

    isFormValid(): boolean {
        return this.contactForm.get('type')?.valid === true && this.contactForm.get('description')?.valid === true;
    }
} 