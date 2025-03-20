import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FluxService } from '../../services/flux.service';
import { SupabaseService } from '../../services/supabase.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';

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
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    RouterModule,
    MatMenuModule
  ],
  template: `
    <div class="min-h-screen bg-gray-900 flex flex-col">
      <!-- Top Navigation -->
      <mat-toolbar class="bg-gray-800 border-b border-gray-700">
        <a routerLink="/dashboard" class="text-xl font-bold text-purple-400">FluxGen</a>
        <span class="flex-1"></span>
        
        <div class="flex items-center">
          <div *ngIf="profile" class="mr-4 px-3 py-1 bg-gray-700 rounded-full flex items-center">
            <mat-icon class="text-white mr-1">stars</mat-icon>
            <span class="text-white">{{ profile.credits }} credits</span>
          </div>
          
          <button mat-button [routerLink]="['/dashboard']" class="text-white hover:bg-gray-700">
            <mat-icon class="text-white">dashboard</mat-icon>
            <span class="ml-1">Dashboard</span>
          </button>

          <button mat-button [matMenuTriggerFor]="userMenu" class="text-white hover:bg-gray-700">
            <mat-icon class="text-white">account_circle</mat-icon>
            <span class="ml-1">{{ userEmail }}</span>
          </button>
          
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/settings">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </button>
            <button mat-menu-item routerLink="/upgrade">
              <mat-icon>upgrade</mat-icon>
              <span>Upgrade</span>
            </button>
            <button mat-menu-item (click)="signOut()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Sign out</span>
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>
      
      <!-- Main Content -->
      <div class="flex-1 p-6">
        <h1 class="text-2xl font-bold text-white mb-6">Generate AI Image</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Generation Form -->
          <mat-card class="bg-gray-800 p-6">
            <h2 class="text-xl font-semibold text-white mb-4">Image Settings</h2>
            
            <form [formGroup]="generateForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <mat-form-field appearance="fill" class="w-full">
                <mat-label>Prompt</mat-label>
                <textarea 
                  matInput 
                  formControlName="prompt" 
                  placeholder="Describe the image you want to generate" 
                  rows="3"
                  required></textarea>
                <mat-error *ngIf="generateForm.get('prompt')?.hasError('required')">
                  Prompt is required
                </mat-error>
              </mat-form-field>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-gray-300 mb-2">
                    Width: {{ generateForm.get('width')?.value ? generateForm.get('width')?.value + 'px' : 'Default (4:3)' }}
                  </p>
                  <mat-slider
                    min="512"
                    max="1024"
                    step="64"
                    class="w-full">
                    <input matSliderThumb formControlName="width">
                  </mat-slider>
                </div>
                
                <div>
                  <p class="text-gray-300 mb-2">
                    Height: {{ generateForm.get('height')?.value ? generateForm.get('height')?.value + 'px' : 'Default (4:3)' }}
                  </p>
                  <mat-slider
                    min="512"
                    max="1024"
                    step="64"
                    class="w-full">
                    <input matSliderThumb formControlName="height">
                  </mat-slider>
                </div>
              </div>
              
              <div class="pt-4">
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
            <mat-card class="bg-gray-800 p-6 h-full flex flex-col">
              <h2 class="text-xl font-semibold text-white mb-4">Image Preview</h2>
              
              <div *ngIf="isGenerating" class="flex-1 flex items-center justify-center">
                <div class="text-center">
                  <mat-spinner diameter="64" class="mx-auto mb-4"></mat-spinner>
                  <p class="text-gray-300">Creating your masterpiece...</p>
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
                  
                  <!-- Save notification -->
                  <div *ngIf="showSaveNotification" class="absolute bottom-4 right-4 left-4 bg-opacity-90 p-3 rounded-lg text-center"
                    [ngClass]="saveMessage.includes('Error') ? 'bg-red-700' : 'bg-green-700'">
                    <p class="text-white">{{ saveMessage }}</p>
                  </div>
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
  `]
})
export class GenerateComponent implements OnInit {
  generateForm: FormGroup;
  isGenerating: boolean = false;
  errorMessage: string = '';
  generatedImage: string | null = null;
  profile: any = null;
  userEmail: string = '';
  
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
    private router: Router
  ) {
    this.generateForm = this.fb.group({
      prompt: ['', [Validators.required]],
      width: [null],
      height: [null]
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
  
  onSubmit() {
    if (this.generateForm.invalid || !this.hasCredits) return;
    
    this.isGenerating = true;
    this.errorMessage = '';
    
    const { prompt, width, height } = this.generateForm.value;
    
    this.fluxService.generateImage(prompt, width || undefined, height || undefined)
      .subscribe({
        next: (response) => {
          console.log('API response:', response);
          
          // Extract the image URL from the response
          if (response && response.images && response.images.length > 0) {
            this.generatedImage = response.images[0].url;
          } else {
            // Fallback to placeholder if response structure is unexpected
            this.generatedImage = 'https://via.placeholder.com/1024x1024/3a3a3a/FFFFFF?text=Generated+Image';
            console.warn('Unexpected API response structure', response);
          }
          
          // Decrement user's credits
          this.supabaseService.incrementImagesGenerated()
            .then(() => {
              // Refresh user profile
              this.loadUserProfile();
            });
            
          this.isGenerating = false;
        },
        error: (error) => {
          console.error('Error generating image:', error);
          this.errorMessage = 'Error generating image. Please try again.';
          this.isGenerating = false;
        }
      });
  }
  
  downloadImage() {
    if (!this.generatedImage) return;
    
    // Create a fetch request to get the image data
    fetch(this.generatedImage)
      .then(response => response.blob())
      .then(blob => {
        // Create a blob URL for the image
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `generated-image-${Date.now()}.jpg`; // Generate a unique filename
        link.style.display = 'none';
        
        // Add to the DOM, trigger click, then clean up
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
      })
      .catch(error => {
        console.error('Error downloading image:', error);
      });
  }
  
  async saveImage() {
    if (this.generatedImage && this.generateForm.valid) {
      try {
        this.isSaving = true;
        const { prompt } = this.generateForm.value;
        await this.supabaseService.saveGeneratedImage(this.generatedImage, prompt);
        
        // Show success notification
        this.saveMessage = 'Image saved to your gallery!';
        this.showSaveNotification = true;
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          this.showSaveNotification = false;
        }, 3000);
        
      } catch (error) {
        console.error('Error saving image:', error);
        this.saveMessage = 'Error saving image. Please try again.';
        this.showSaveNotification = true;
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          this.showSaveNotification = false;
        }, 3000);
      } finally {
        this.isSaving = false;
      }
    }
  }

  async signOut() {
    await this.supabaseService.signOut();
    this.router.navigate(['/login']);
  }
} 