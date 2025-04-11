import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavBarComponent } from '../shared/nav-bar/nav-bar.component';
import { SupabaseService } from '../../services/supabase.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NavBarComponent
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

  constructor(private supabaseService: SupabaseService, private router: Router, private snackBar: MatSnackBar) {}

  async ngOnInit() {
    await this.loadUserData();
    await this.loadImages();
    this.checkPaymentSuccess();
  }

  private async loadUserData() {
    const user = this.supabaseService.currentUser;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.userEmail = user.email || '';
    this.profile = await this.supabaseService.getProfile();
  }

  private async loadImages() {
    try {
      this.images = await this.supabaseService.getGeneratedImages();
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private checkPaymentSuccess() {
    const params = new URLSearchParams(window.location.search);
    const paymentSuccess = params.get('payment_success');
    if (paymentSuccess === 'true') {
      this.showSuccessNotification = true;
      this.successMessage = 'Payment successful! Your credits have been added to your account.';
      // Remove the query parameter
      window.history.replaceState({}, '', '/gallery');
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

  async signOut() {
    await this.supabaseService.signOut();
    this.router.navigate(['/login']);
  }
} 