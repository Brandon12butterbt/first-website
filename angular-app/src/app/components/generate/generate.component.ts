import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FluxService } from '../../services/flux.service';
import { SupabaseService } from '../../services/supabase.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { NavBarComponent } from '../shared/nav-bar/nav-bar.component';
import { NgxTurnstileModule, NgxTurnstileFormsModule } from 'ngx-turnstile';
import { ConfigService } from '../../services/config.service';

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
    NavBarComponent,
    NgxTurnstileModule,
    NgxTurnstileFormsModule
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
  
  // Add a property to track save status
  saveMessage: string = '';
  isSaving: boolean = false;
  showSaveNotification: boolean = false;
  get hasCredits(): boolean {
    return this.profile?.credits > 0;
  }
  
  constructor(
    private fb: FormBuilder,
    private fluxService: FluxService,
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public config: ConfigService
  ) {
    this.turnWidgetSiteKey = this.config.turnWidgetSiteKey;
    this.generateForm = this.fb.group({
      prompt: ['', [Validators.required]],
      turnstileToken: [null, Validators.required]
    });
  }
  
  ngOnInit() {
    this.loadUserProfile();
  }
  
  async loadUserProfile() {
    try {
      const user = this.supabaseService.currentUser;
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      
      this.userEmail = user.email || '';
      
      // Get the user profile (this will create one if it doesn't exist)
      this.profile = await this.supabaseService.getProfile();
      
      // For testing purposes, ensure we have credits to use
      if (this.profile && this.profile.credits === 0) {
        await this.supabaseService.updateCredits(5);
        this.profile = await this.supabaseService.getProfile();
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // If profile loading fails, use a default profile with credits
      this.profile = { credits: 5, images_generated: 0 };
    }
  }
  
  async onSubmit() {
    if (this.generateForm.invalid || !this.hasCredits) return;
    
    this.isGenerating = true;
    this.errorMessage = '';
    this.lastUpdateTime = new Date().toLocaleTimeString();
    
    const { prompt, turnstileToken } = this.generateForm.value;
    console.log('Submitting with Turnstile token:', turnstileToken);
    
    console.log('Starting image generation...');
    
    // Set a safety timeout to ensure the spinner stops even if something goes wrong
    setTimeout(() => {
      if (this.isGenerating) {
        console.log('Safety timeout triggered - forcing spinner to stop');
        this.isGenerating = false;
        this.lastUpdateTime = new Date().toLocaleTimeString() + ' (timeout)';
        
        if (!this.generatedImage) {
          this.generatedImage = 'https://via.placeholder.com/1024x1024/3a3a3a/FFFFFF?text=Generated+Image';
          this.errorMessage = 'Generation timeout. Please try again.';
        }
      }
    }, 30000);
    
    try {
      // Call the API and get the image blob
      const imageBlob = await firstValueFrom(this.fluxService.generateImage(prompt));

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
      
      console.log('Image blob received in component, size:', imageBlob.size);
      this.lastUpdateTime = new Date().toLocaleTimeString() + ' (success)';
      
      // Create a URL for the blob (temporary, for display only)
      this.generatedImage = URL.createObjectURL(imageBlob);
      console.log('Image URL created:', this.generatedImage);
      
      // Decrement user's credits
      await this.supabaseService.incrementImagesGenerated();
      await this.loadUserProfile();
      
    } catch (error) {
      console.error('Error in component when generating image:', error);
      this.errorMessage = 'Error generating image. Please try again.';
      this.generatedImage = null;
      this.lastUpdateTime = new Date().toLocaleTimeString() + ' (error)';
    } finally {
      console.log('Generation process completed');
      this.isGenerating = false;
      this.lastUpdateTime = new Date().toLocaleTimeString() + ' (complete)';
      
      // Force Angular to detect changes
      try {
        this.cdr.detectChanges();
        console.log('Change detection triggered');
      } catch (e) {
        console.warn('Error during change detection:', e);
      }
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
        await this.supabaseService.saveGeneratedImage(dataUrl, prompt);
        
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

  async signOut() {
    await this.supabaseService.signOut();
    this.router.navigate(['/']);
  }

  // Add this to clean up blob URLs when no longer needed
  ngOnDestroy() {
    // Revoke any blob URLs to prevent memory leaks
    if (this.generatedImage && this.generatedImage.startsWith('blob:')) {
      URL.revokeObjectURL(this.generatedImage);
    }
  }

  sendCaptchaResponse(captchaResponse: any) {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
  }
} 