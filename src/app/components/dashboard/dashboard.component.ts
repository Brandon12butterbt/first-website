import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatMenuModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule
  ],
  template: `
    <div class="min-h-screen bg-gray-900 flex flex-col">
      <!-- Top Navigation -->
      <mat-toolbar class="bg-gray-800 border-b border-gray-700">
        <div class="container mx-auto flex items-center justify-center">
          <span class="text-xl font-bold text-purple-400 mr-6">AFluxGen</span>
          
          <button mat-button routerLink="/generate" class="text-white hover:bg-gray-700 mx-2">
            <mat-icon>add_photo_alternate</mat-icon>
            <span class="ml-1">Generate</span>
          </button>
          
          <div *ngIf="profile" class="px-2 py-0.5 bg-gray-700 rounded-full flex items-center mx-2 text-sm">
            <mat-icon class="text-yellow-400 mr-1" style="font-size: 16px; height: 16px; width: 16px; line-height: 16px;">stars</mat-icon>
            <span class="text-white">{{ profile.credits }} credits</span>
          </div>
          
          <button mat-button [matMenuTriggerFor]="userMenu" class="text-white hover:bg-gray-700 mx-2">
            <mat-icon>account_circle</mat-icon>
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
      
      <!-- Payment success notification -->
      <div *ngIf="showSuccessNotification" class="bg-green-700 text-white p-4 text-center flex justify-center items-center">
        <mat-icon class="mr-2">check_circle</mat-icon>
        <span>{{ successMessage }}</span>
        <button mat-icon-button (click)="showSuccessNotification = false" class="ml-4">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <!-- Main Content -->
      <div class="flex-1 p-6">
        <h1 class="text-2xl font-bold text-white mb-6">Your Generated Images</h1>
        
        <div *ngIf="isLoading" class="text-center py-12">
          <mat-spinner></mat-spinner>
          <p class="mt-4 text-gray-400">Loading your images...</p>
        </div>
        
        <div *ngIf="!isLoading && images.length === 0" class="bg-gray-800 rounded-lg p-8 text-center">
          <mat-icon class="text-6xl text-gray-600 mb-4">image_not_supported</mat-icon>
          <h2 class="text-xl font-semibold text-white mb-2">No images yet</h2>
          <p class="text-gray-400 mb-6">Generate your first AI image to see it here.</p>
          <button mat-raised-button color="primary" routerLink="/generate" class="bg-purple-600 hover:bg-purple-700">
            <span class="text-white">Generate your first image</span>
          </button>
        </div>
        
        <div *ngIf="!isLoading && images.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <mat-card *ngFor="let image of images" class="bg-gray-800 overflow-hidden">
            <img [src]="image.image_url" [alt]="image.prompt" class="w-full h-60 object-cover">
            <mat-card-content class="p-4">
              <p class="text-gray-300 text-sm truncate">{{ image.prompt }}</p>
              <p class="text-gray-500 text-xs mt-1">{{ image.created_at | date }}</p>
            </mat-card-content>
            <mat-card-actions class="p-4 pt-0 flex justify-between">
              <button mat-button class="text-purple-400" (click)="downloadImage(image)">
                <mat-icon>download</mat-icon> Download
              </button>
              <button mat-button class="text-red-400" (click)="deleteImage(image.id)">
                <mat-icon>delete</mat-icon> Delete
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  userEmail: string = '';
  profile: any = null;
  images: any[] = [];
  isLoading: boolean = true;
  showSuccessNotification: boolean = false;
  successMessage: string = '';
  
  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit() {
    this.loadUserData();
    this.loadImages();
    this.checkPaymentSuccess();
  }
  
  async loadUserData() {
    const user = this.supabaseService.currentUser;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.userEmail = user.email || '';
    this.profile = await this.supabaseService.getProfile();
  }
  
  async loadImages() {
    try {
      this.images = await this.supabaseService.getGeneratedImages();
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  checkPaymentSuccess() {
    this.route.queryParams.subscribe(params => {
      if (params['payment'] === 'success') {
        const packageName = params['package'];
        const credits = params['credits'];
        
        if (packageName && credits) {
          this.successMessage = `Payment successful! ${credits} credits added from ${packageName} package.`;
          this.showSuccessNotification = true;
          
          // Clear the URL parameters
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true
          });
        }
      }
    });
  }
  
  async signOut() {
    await this.supabaseService.signOut();
    this.router.navigate(['/login']);
  }
  
  downloadImage(image: any) {
    if (!image.image_url) return;
    
    const link = document.createElement('a');
    link.href = image.image_url;
    link.download = `generated-image-${Date.now()}.png`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  }
  
  async deleteImage(imageId: string) {
    try {
      const success = await this.supabaseService.deleteGeneratedImage(imageId);
      if (success) {
        this.snackBar.open('Image deleted successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['bg-gray-800', 'text-white']
        });
        // Refresh the image list
        this.loadImages();
      } else {
        this.snackBar.open('Failed to delete image', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['bg-red-700', 'text-white']
        });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      this.snackBar.open('Error deleting image', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['bg-red-700', 'text-white']
      });
    }
  }
} 