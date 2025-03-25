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
import { NavBarComponent } from '../shared/nav-bar.component';

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
    NavBarComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-900 flex flex-col">
      <!-- Top Navigation -->
      <app-nav-bar [userEmail]="userEmail" [profile]="profile" (signOut)="signOut()"></app-nav-bar>
      
      <!-- Main Content -->
      <div class="flex-1 p-6">
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Generation Form -->
          <mat-card class="bg-gray-800 p-6 min-h-[60vh]">
            <h2 class="text-xl font-semibold text-white mb-4 select-none">Image Settings</h2>
            
            <form [formGroup]="generateForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>Prompt</mat-label>
                <textarea 
                  matInput 
                  formControlName="prompt" 
                  placeholder="Describe the image you want to generate" 
                  rows="12"
                  class="text-lg"
                  required></textarea>
                <mat-error *ngIf="generateForm.get('prompt')?.hasError('required')">
                  Prompt is required
                </mat-error>
              </mat-form-field>
              
              <div class="pt-8">
                <button 
                  mat-raised-button 
                  color="primary" 
                  type="submit" 
                  class="w-full bg-purple-600 hover:bg-purple-700 py-2"
                  [disabled]="isGenerating || !generateForm.valid || !hasCredits">
                  <span *ngIf="isGenerating">
                    <mat-spinner diameter="24" class="inline-block mr-2"></mat-spinner>
                    <span class="text-white">Generating...</span>
                  </span>
                  <span *ngIf="!isGenerating && hasCredits">
                    <mat-icon class="text-white">auto_awesome</mat-icon>
                    <span class="text-white">Generate Image (1 Credit)</span>
                  </span>
                </button>
                
                <button 
                  *ngIf="!isGenerating && !hasCredits"
                  mat-raised-button 
                  color="accent" 
                  routerLink="/upgrade" 
                  class="w-full bg-purple-600 hover:bg-purple-700 py-2 mt-2">
                  <mat-icon class="text-white">shopping_cart</mat-icon>
                  <span class="text-white">Purchase Credits</span>
                </button>
              </div>
              
              <div *ngIf="errorMessage" class="text-red-500 mt-2 text-center">
                {{ errorMessage }}
              </div>
            </form>
          </mat-card>
          
          <!-- Preview Area -->
          <div class="flex flex-col">
            <mat-card class="bg-gray-800 p-6 h-full flex flex-col min-h-[60vh]">
              <h2 class="text-xl font-semibold text-white mb-4 select-none">Image Preview</h2>
              
              <div *ngIf="isGenerating" class="flex-1 flex items-center justify-center">
                <div class="text-center">
                  <mat-spinner diameter="64" class="mx-auto mb-4"></mat-spinner>
                  <p class="text-gray-300">Creating your masterpiece...</p>
                  <p class="text-gray-400 text-sm mt-2">This may take up to 30 seconds</p>
                </div>
              </div>
              
              <div *ngIf="!isGenerating && !generatedImage" class="flex-1 flex items-center justify-center bg-gray-700 rounded-lg">
                <div class="text-center p-8">
                  <mat-icon class="text-6xl text-gray-500 mb-4">image</mat-icon>
                  <p class="text-gray-400">Your generated image will appear here</p>
                </div>
              </div>
              
              <div *ngIf="!isGenerating && generatedImage" class="flex-1 flex flex-col">
                <div class="relative flex-1">
                  <img [src]="generatedImage" alt="Generated image" class="w-full h-full object-contain rounded-lg">
                </div>
                
                <div class="flex justify-between mt-4">
                  <button mat-raised-button color="primary" (click)="downloadImage()" class="bg-purple-600 hover:bg-purple-700">
                    <mat-icon class="text-white">download</mat-icon>
                    <span class="text-white">Download</span>
                  </button>
                  
                  <button mat-raised-button color="accent" (click)="saveImage()" class="bg-purple-600 hover:bg-purple-700"
                    [disabled]="isSaving">
                    <mat-spinner *ngIf="isSaving" diameter="20" class="inline-block mr-2"></mat-spinner>
                    <mat-icon *ngIf="!isSaving" class="text-white">save</mat-icon>
                    <span class="text-white">{{ isSaving ? 'Saving...' : 'Save to Gallery' }}</span>
                  </button>
                </div>
              </div>
            </mat-card>
          </div>
        </div>
      </div>
      
      <!-- Fixed position save notification that won't be hidden by scrolling -->
      <div *ngIf="showSaveNotification" 
        class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-lg text-center shadow-xl min-w-64 animate-bounce-in"
        [ngClass]="saveMessage.includes('Error') ? 'bg-red-600 text-white' : 'bg-green-600 text-white'">
        <div class="flex items-center justify-center">
          <mat-icon class="mr-2">{{ saveMessage.includes('Error') ? 'error' : 'check_circle' }}</mat-icon>
          <p class="text-lg font-medium">{{ saveMessage }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .mat-form-field {
      width: 100%;
    }
    
    ::ng-deep .mat-form-field-flex {
      background-color: rgba(30, 34, 45, 0.6) !important;
    }
    
    ::ng-deep .mat-form-field-underline {
      background-color: rgba(255, 255, 255, 0.2) !important;
    }
    
    ::ng-deep .mat-form-field.mat-focused .mat-form-field-ripple {
      background-color: #9e66e4 !important;
    }
    
    ::ng-deep .mat-form-field-label, 
    ::ng-deep .mat-form-field-required-marker {
      color: rgba(255, 255, 255, 0.7) !important;
    }
    
    ::ng-deep .mat-input-element {
      color: white !important;
    }
    
    ::ng-deep .mat-form-field-invalid .mat-form-field-ripple {
      background-color: #f44336 !important;
    }
    
    /* Animation for notification */
    @keyframes bounceIn {
      0% { transform: translate(-50%, -20px); opacity: 0; }
      50% { transform: translate(-50%, 10px); opacity: 0.7; }
      100% { transform: translate(-50%, 0); opacity: 1; }
    }
    
    .animate-bounce-in {
      animation: bounceIn 0.5s ease-out forwards;
    }
  `]
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
    private cdr: ChangeDetectorRef
  ) {
    this.generateForm = this.fb.group({
      prompt: ['', [Validators.required]]
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
    
    const { prompt } = this.generateForm.value;
    
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
      const imageBlob = await firstValueFrom(
        this.fluxService.generateImage(prompt)
      );
      
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
    this.router.navigate(['/login']);
  }

  // Add this to clean up blob URLs when no longer needed
  ngOnDestroy() {
    // Revoke any blob URLs to prevent memory leaks
    if (this.generatedImage && this.generatedImage.startsWith('blob:')) {
      URL.revokeObjectURL(this.generatedImage);
    }
  }
} 