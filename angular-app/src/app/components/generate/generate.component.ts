import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FluxService } from '../../services/flux.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { NgxTurnstileModule, NgxTurnstileFormsModule } from 'ngx-turnstile';
import { trigger, transition, style, animate } from '@angular/animations';

import { ConfigService } from '../../services/config.service';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { CountdownService } from '../../services/image-countdown.service';

@Component({
  selector: 'app-generate',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule,
    NgxTurnstileModule,
    NgxTurnstileFormsModule
  ],
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class GenerateComponent implements OnInit, OnDestroy {
  generateForm: FormGroup;
  isGenerating: boolean = false;
  errorMessage: string = '';
  generatedImage: string | null = null;
  profile: any = null;
  userEmail: string = '';
  lastUpdateTime: string = 'Not started';
  imageUrl: string | null = null;
  turnWidgetSiteKey: string = '';
  isTurnstileVerified = false;
  countdownText = 'Ready';
  isLoading: boolean = true;
  
  // Add a property to track save status
  saveMessage: string = '';
  isSaving: boolean = false;
  showSaveNotification: boolean = false;
  session: any = null;
  get hasCredits(): boolean {
    return this.profile?.credits > 0;
  }
  
  constructor(
    private fb: FormBuilder,
    private fluxService: FluxService,
    private cdr: ChangeDetectorRef,
    public config: ConfigService,
    private supabaseAuthService: SupabaseAuthService,
    private countdownService: CountdownService
  ) {
    this.turnWidgetSiteKey = this.config.turnWidgetSiteKey;
    this.generateForm = this.fb.group({
      prompt: ['', [Validators.required]],
      turnstileToken: [null]
    });
  }
  
  async ngOnInit() {
    this.countdownService.countdown$.subscribe(text => {
      this.countdownText = text;
      this.cdr.detectChanges();
    });
    
    this.countdownService.startCountdown();

    // If turnstile key is not set, mark as verified (skip verification)
    if (!this.turnWidgetSiteKey) {
      this.isTurnstileVerified = true;
    }

    this.session = await this.supabaseAuthService.ensureSessionLoaded();
    if (this.session) {
      await this.getFluxProfile(this.session);
    } else {
      // Still show UI even if not logged in
      this.isLoading = false;
    }
  }

  async getFluxProfile(session: any) {
    try {
      const { user } = session;
      const { data: profile, error, status } = await this.supabaseAuthService.fluxProfile(user.id);
      if (error && status !== 406) {
        throw error;
      }
      if (profile) {
        this.profile = profile;
      }
    } catch (error) {
      this.session = null;
      console.log(error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
  
  // New helper method to check form validity
  isFormValid(): boolean {
    // If turnstile is visible and not verified, form is invalid
    if (this.turnWidgetSiteKey && !this.isTurnstileVerified) {
      return false;
    }
    
    // Otherwise just check if prompt is valid
    return this.generateForm.get('prompt')?.valid === true;
  }

  async onSubmit() {
    // Use our custom validator instead of the form's built-in valid state
    if (!this.isFormValid()) {
      // If Turnstile is required but not verified, show a specific error
      if (this.turnWidgetSiteKey && !this.isTurnstileVerified) {
        this.errorMessage = 'Please complete the verification before generating an image';
        this.cdr.detectChanges();
      }
      return;
    }
    
    if (!this.hasCredits) return;
    
    this.isGenerating = true;
    this.errorMessage = '';
    this.lastUpdateTime = new Date().toLocaleTimeString();
    
    const { prompt, turnstileToken } = this.generateForm.value;
    
    // Set a safety timeout to ensure the spinner stops even if something goes wrong
    setTimeout(() => {
      if (this.isGenerating) {
        this.isGenerating = false;
        this.lastUpdateTime = new Date().toLocaleTimeString() + ' (timeout)';
        
        if (!this.generatedImage) {
          this.generatedImage = 'https://via.placeholder.com/1024x1024/3a3a3a/FFFFFF?text=Generated+Image';
          this.errorMessage = 'Generation timeout. Please try again.';
        }
        this.cdr.detectChanges();
      }
    }, 30000);

    try {
      // Call the API and get the image blob
      const imageBlob = await firstValueFrom(this.fluxService.callGenerateImage(prompt));

      if (imageBlob.error === 'rate_limited') {
        this.errorMessage = imageBlob.message;
        this.lastUpdateTime = new Date().toLocaleTimeString() + ' (error)';
        this.isGenerating = false;
        this.cdr.detectChanges();
        return;
      }
    
      if (imageBlob.error === 'api_error') {
        console.error('API request failed:', imageBlob.message);
        this.errorMessage = 'There was a problem generating the image. Please try again.';
        this.isGenerating = false;
        this.cdr.detectChanges();
        return;
      }
      
      this.lastUpdateTime = new Date().toLocaleTimeString() + ' (success)';
      
      // Create a URL for the blob (temporary, for display only)
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Validate the image loads correctly before displaying
      const img = new Image();
      img.onload = () => {
        this.generatedImage = imageUrl;
        this.cdr.detectChanges();
      };
      
      img.onerror = () => {
        console.error('Failed to load generated image');
        this.errorMessage = 'Failed to load the generated image. Please try again.';
        URL.revokeObjectURL(imageUrl);
        this.cdr.detectChanges();
      };
      
      img.src = imageUrl;
      
      // Decrement user's credits
      await this.supabaseAuthService.imageGeneratedUpdateProfile(this.profile.id, this.profile.images_generated, this.profile.credits);
      await this.getFluxProfile(this.session);
      
    } catch (error) {
      console.error('Error in component when generating image:', error);
      this.errorMessage = 'Error generating image. Please try again.';
      this.generatedImage = null;
      this.lastUpdateTime = new Date().toLocaleTimeString() + ' (error)';
    } finally {
      this.isGenerating = false;
      this.lastUpdateTime = new Date().toLocaleTimeString() + ' (complete)';
      this.cdr.detectChanges();

      // Used to trigger nav bar profile credits update
      this.supabaseAuthService.triggerAuthChange('SIGNED_IN', this.session);
    }
  }
  
  downloadImage() {
    if (!this.generatedImage) return;
    
    // For blob URLs, we can use them directly
    if (this.generatedImage.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = this.generatedImage;
      link.download = `generated-image-${Date.now()}.png`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        // Don't revoke here as we might still need it for display
      }, 100);
    } 
    // For data URLs or other formats
    else {
      const link = document.createElement('a');
      link.href = this.generatedImage;
      link.download = `generated-image-${Date.now()}.png`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    }
  }
  
  async saveImage() {
    if (!this.generatedImage || this.isSaving) return;
    
    this.isSaving = true;
    this.saveMessage = '';
    this.showSaveNotification = false;
    
    try {
      const { prompt } = this.generateForm.value;
      
      // Convert blob URL to a data URL that can be stored persistently
      const response = await fetch(this.generatedImage);
      const blob = await response.blob();

      // Convert blob to base64 data URL
      const reader = new FileReader();
      const dataUrlPromise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const dataUrl = await dataUrlPromise;
      
      // Save the data URL to Supabase
      const result = await this.supabaseAuthService.saveGeneratedImage(this.profile.id, dataUrl, prompt);
      
      if (!result.error) {
        this.saveMessage = 'Image saved to your gallery';
        this.showSaveNotification = true;
        
        // Auto-hide the notification after a delay
        setTimeout(() => {
          this.showSaveNotification = false;
          this.cdr.detectChanges();
        }, 3000);
      } else {
        console.error('Error saving image:', result.error);
        this.saveMessage = 'Error: Failed to save image';
        this.showSaveNotification = true;
        
        // Auto-hide the notification after a delay
        setTimeout(() => {
          this.showSaveNotification = false;
          this.cdr.detectChanges();
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving image to gallery:', error);
      this.saveMessage = 'Error: Failed to save image';
      this.showSaveNotification = true;
      
      // Auto-hide the notification after a delay
      setTimeout(() => {
        this.showSaveNotification = false;
        this.cdr.detectChanges();
      }, 3000);
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }
  
  ngOnDestroy() {
    // Clean up any subscriptions
    if (this.generatedImage && this.generatedImage.startsWith('blob:')) {
      URL.revokeObjectURL(this.generatedImage);
    }
  }
  
  onTurnstileSuccess(token: any) {
    // Set the token value in the form
    this.generateForm.get('turnstileToken')?.setValue(token);
    this.isTurnstileVerified = true;
    console.log('Turnstile verified:', token);
    this.cdr.detectChanges();
  }
} 