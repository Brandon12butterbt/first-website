import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { SupabaseAuthService } from '../../services/supabase-auth.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  userEmail: string = '';
  profile: any = null;
  isLoading = true;
  images: any[] = [];
  showSuccessNotification = false;
  successMessage = '';

  constructor(private router: Router, private snackBar: MatSnackBar, private supabaseAuthService: SupabaseAuthService) {}

  async ngOnInit() {
    // await this.loadUserData();
    // await this.loadImages();

    const session = await this.supabaseAuthService.ensureSessionLoaded();
    if (session) {
      await this.getFluxProfile(session);
      await this.getGeneratedImages();
    }
  }

  async downloadImage(image: any) {
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
      console.log(error);
    } finally {
      return;
    }
  }

  async getGeneratedImages() {
    try {
      // Wait for user state to be initialized
      if (!this.profile) {
        // Wait up to 5 seconds for user state to be ready
        let attempts = 0;
        while (!this.profile.id && attempts < 5) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
        
        if (!this.profile.id) {
          console.warn('User state not initialized after waiting, returning empty array');
          return [];
        }
      }

      const { data } = await this.supabaseAuthService.fluxImages(this.profile.id);

      this.images = data || [];
    } catch (error) {
      console.error('Error getting generated images:', error);
      return [];
    } finally {
      this.isLoading = false;
      return;
    }
  }

  async deleteFluxImage(imageId: string) {
    try {
      await this.supabaseAuthService.deleteFluxImage(this.profile.id, imageId);

      this.snackBar.open('Image deleted successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['bg-gray-800', 'text-white']
      });

      // Refresh the image list
      this.getGeneratedImages();
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