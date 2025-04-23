import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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

import { ConfigService } from '../../services/config.service';
import { ImageCountdownComponent } from '../shared/image-countdown/image-countdown.component';
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
    NgxTurnstileFormsModule,
    ImageCountdownComponent
  ],
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.css']
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
    private router: Router,
    private cdr: ChangeDetectorRef,
    public config: ConfigService,
    private supabaseAuthService: SupabaseAuthService,
    private countdownService: CountdownService
  ) {
    this.turnWidgetSiteKey = this.config.turnWidgetSiteKey;
    this.generateForm = this.fb.group({
      prompt: ['', [Validators.required]],
      turnstileToken: [null, Validators.required]
    });
  }
  
  async ngOnInit() {
    // this.loadUserProfile();
    this.countdownService.countdown$.subscribe(text => {
      this.countdownText = text;
    });
    
    this.countdownService.startCountdown();

    this.session = await this.supabaseAuthService.ensureSessionLoaded();
    if (this.session) {
      await this.getFluxProfile(this.session);
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
      if (error instanceof Error) {
        this.session = null;
        console.log(error);
      }
    } finally {
      this.isLoading = false;
    }
  }
  
  async onSubmit() {
    if (this.generateForm.invalid || !this.hasCredits) return;
    
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
      }
    }, 30000);
    
    // try {
    //   // Call the API and get the image blob
    //   const imageBlob = await firstValueFrom(this.fluxService.generateImage(prompt));

    //   if (imageBlob.error === 'rate_limited') {
    //     this.errorMessage = imageBlob.message;
    //     this.lastUpdateTime = new Date().toLocaleTimeString() + ' (error)';
    //     return;
    //   }
    
    //   if (imageBlob.error === 'api_error') {
    //     console.error('API request failed:', imageBlob.message);
    //     alert('There was a problem generating the image. Please try again.');
    //     return;
    //   }
      
    //   this.lastUpdateTime = new Date().toLocaleTimeString() + ' (success)';
      
    //   // Create a URL for the blob (temporary, for display only)
    //   this.generatedImage = URL.createObjectURL(imageBlob);
      
    //   // Decrement user's credits
    //   await this.supabaseAuthService.imageGeneratedUpdateProfile(this.profile.id, this.profile.images_generated, this.profile.credits);
    //   await this.getFluxProfile(this.supabaseAuthService.session);
      
    // } catch (error) {
    //   console.error('Error in component when generating image:', error);
    //   this.errorMessage = 'Error generating image. Please try again.';
    //   this.generatedImage = null;
    //   this.lastUpdateTime = new Date().toLocaleTimeString() + ' (error)';
    // } finally {
    //   this.isGenerating = false;
    //   this.lastUpdateTime = new Date().toLocaleTimeString() + ' (complete)';
      
    //   // Force Angular to detect changes
    //   try {
    //     this.cdr.detectChanges();
    //   } catch (e) {
    //     console.warn('Error during change detection:', e);
    //   }
    // }

    try {
      // Call the API and get the image blob
      const imageBlob = await firstValueFrom(this.fluxService.callGenerateImage(prompt));

      if (imageBlob.error === 'rate_limited') {
        this.errorMessage = imageBlob.message;
        this.lastUpdateTime = new Date().toLocaleTimeString() + ' (error)';
        return;
      }
    
      if (imageBlob.error === 'api_error') {
        console.error('API request failed:', imageBlob.message);
        alert('There was a problem generating the image. Please try again.');
        return;
      }
      console.log('no errors in call');
      
      this.lastUpdateTime = new Date().toLocaleTimeString() + ' (success)';
      
      console.log('image blob: ', imageBlob);
      // Create a URL for the blob (temporary, for display only)
      this.generatedImage = URL.createObjectURL(imageBlob);

      console.log('generated image: ', this.generatedImage);
      
      // Decrement user's credits
      await this.supabaseAuthService.imageGeneratedUpdateProfile(this.profile.id, this.profile.images_generated, this.profile.credits);
      await this.getFluxProfile(this.supabaseAuthService.session);
      
    } catch (error) {
      console.error('Error in component when generating image:', error);
      this.errorMessage = 'Error generating image. Please try again.';
      this.generatedImage = null;
      this.lastUpdateTime = new Date().toLocaleTimeString() + ' (error)';
    } finally {
      this.isGenerating = false;
      this.lastUpdateTime = new Date().toLocaleTimeString() + ' (complete)';
      
      // Force Angular to detect changes
      try {
        this.cdr.detectChanges();
      } catch (e) {
        console.warn('Error during change detection:', e);
      }

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
    if (this.generatedImage && this.generateForm.valid) {
      try {
        this.isSaving = true;
        this.showSaveNotification = false; // Reset notification
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
        
        // Now save the data URL to Supabase
        await this.supabaseAuthService.saveGeneratedImage(this.profile.id, dataUrl, prompt);
        
        // Show success notification
        this.saveMessage = 'Image saved to your gallery!';
        this.showSaveNotification = true;
        
        // Ensure the change is detected
        this.cdr.detectChanges();
        
        // Hide notification after 5 seconds (increased from 3)
        setTimeout(() => {
          this.showSaveNotification = false;
          this.cdr.detectChanges();
        }, 5000);
        
      } catch (error) {
        console.error('Error saving image:', error);
        this.saveMessage = 'Error saving image. Please try again.';
        this.showSaveNotification = true;
        
        // Ensure the change is detected
        this.cdr.detectChanges();
        
        // Hide notification after 5 seconds (increased from 3)
        setTimeout(() => {
          this.showSaveNotification = false;
          this.cdr.detectChanges();
        }, 5000);
      } finally {
        this.isSaving = false;
      }
    }
  }

  ngOnDestroy() {
    if (this.generatedImage && this.generatedImage.startsWith('blob:')) {
      URL.revokeObjectURL(this.generatedImage);
    }
  }

  onTurnstileSuccess(token: any) {
    setTimeout(() => { this.isTurnstileVerified = true; }, 3000);
  }
} 