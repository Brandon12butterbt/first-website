import { Injectable } from '@angular/core';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { SupabaseClientService } from './supabase-client.service';
import { getCreditPackageById } from '../components/shared/credit-packages';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private retryCount = 0;
  private maxRetries = 5; // Maximum number of retries
  private authStateChangeListenerAdded = false; // Flag to track listener
  currentUser$ = this.currentUserSubject.asObservable();
  
  get currentUser(): User | null {
    if (this.currentUserSubject.value) {
      return this.currentUserSubject.value;
    }
  
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      const user: User = JSON.parse(storedUser);
      this.currentUserSubject.next(user);
      return user;
    }
  
    return null;
  }
  
  constructor(private supabaseClientService: SupabaseClientService) {
    this.supabase = this.supabaseClientService.client;
    
    // Subscribe to session changes
    this.supabaseClientService.session$.subscribe(session => {
      if (session) {
        this.currentUserSubject.next(session.user);
        sessionStorage.setItem('currentUser', JSON.stringify(session.user));
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }
  
  private async initializeUserState() {
    try {
      // Wait for initial session to be ready
      const session = this.supabaseClientService.currentSession;
      if (!session) {
        console.log('No session available, waiting for initialization...');
        return;
      }

      this.currentUserSubject.next(session.user);
      sessionStorage.setItem('currentUser', JSON.stringify(session.user));
      
      // Reset retry count on success
      this.retryCount = 0;
    } catch (error: any) {
      console.warn('Error initializing user state:', error);
      console.warn('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
  
      // Check if it's a NavigatorLockAcquireTimeoutError
      if (error.name === 'NavigatorLockAcquireTimeoutError') {
        if (this.retryCount < this.maxRetries) {
          console.log('Retrying due to NavigatorLockAcquireTimeoutError...');
          // Use exponential backoff for retries
          const retryDelay = Math.min(1000 * Math.pow(2, this.retryCount), 10000);
          this.retryCount++;
          setTimeout(() => this.initializeUserState(), retryDelay);
        } else {
          console.error('Max retries reached. Giving up.');
        }
      } else {
        // For other errors, use a simple retry
        if (this.retryCount < this.maxRetries) {
          setTimeout(() => this.initializeUserState(), 1000);
          this.retryCount++;
        } else {
          console.error('Max retries reached. Giving up.');
        }
      }
    }
  }
  
  async signUp(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      let { data, error } = await this.supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  }
  
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Check if profile exists and create one if it doesn't
      if (data.user) {

        const { data: profile, error: profileError } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        this.currentUserSubject.next(data.user);
        sessionStorage.setItem('currentUser', JSON.stringify(data.user));
          
        if (profileError || !profile) {
          // Profile doesn't exist, create one
          await this.createProfile(data.user.id, email);
        }
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  }
  
  async signOut(): Promise<void> {
    try {
      await this.supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
  
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  }
  
  private async createProfile(userId: string, email: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .insert([
          {
            id: userId,  // This is the primary key that references auth.users
            email: email,
            credits: 5,
            images_generated: 0
          }
        ]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }
  
  async getProfile(): Promise<any> {
    try {
      // Check if we have a valid user ID
      if (!this.currentUser?.id) {
        console.warn('No user ID available');
        return null;
      }

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', this.currentUser.id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }
  
  async updateCredits(credits: number): Promise<void> {
    try {
      if (!this.currentUser?.id) {
        console.warn('No user ID available');
        return;
      }
      
      const { error } = await this.supabase
        .from('profiles')
        .update({ credits })
        .eq('id', this.currentUser.id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating credits:', error);
      throw error;
    }
  }

  async savePurchase(tokenTracker: any): Promise<void> {
    try {
      if (!this.currentUser?.id) {
        console.warn('No user ID available');
        return;
      }

      const creditPackage = getCreditPackageById(tokenTracker.package_type);
      
      const { error } = await this.supabase
        .from('token_purchases')
        .insert([
          {
            user_id: this.currentUser.id,
            stripe_payment_intent_id: tokenTracker.package_type,
            status: 'succeeded',
            amount: creditPackage?.credits,
            price: creditPackage?.price
          }
        ]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving purchase:', error);
      throw error;
    }
  }
  
  async incrementImagesGenerated(): Promise<void> {
    try {
      if (!this.currentUser?.id) {
        console.warn('No user ID available');
        return;
      }
      
      // Get the current profile to update
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('credits, images_generated')
        .eq('id', this.currentUser.id)
        .single();
      
      if (profileError) throw profileError;
      
      if (profile) {
        // Update the profile with incremented images and decremented credits
        const { error } = await this.supabase
          .from('profiles')
          .update({ 
            images_generated: profile.images_generated + 1,
            credits: profile.credits - 1
          })
          .eq('id', this.currentUser.id);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error incrementing images generated:', error);
      throw error;
    }
  }
  
  async saveGeneratedImage(imageUrl: string, prompt: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('generated_images')
        .insert([
          {
            user_id: this.currentUser?.id,
            image_url: imageUrl,
            prompt: prompt
          }
        ]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving generated image:', error);
      throw error;
    }
  }
  
  async getGeneratedImages(): Promise<any[]> {
    try {
      // Wait for user state to be initialized
      if (!this.currentUser?.id) {
        // Wait up to 5 seconds for user state to be ready
        let attempts = 0;
        while (!this.currentUser?.id && attempts < 5) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
        
        if (!this.currentUser?.id) {
          console.warn('User state not initialized after waiting, returning empty array');
          return [];
        }
      }

      const { data, error } = await this.supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting generated images:', error);
      return [];
    }
  }
  
  async deleteGeneratedImage(imageId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('generated_images')
        .delete()
        .eq('id', imageId)
        .eq('user_id', this.currentUser?.id); // Security check to ensure user only deletes their own images
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting generated image:', error);
      return false;
    }
  }

  async saveTokenTracker(uuid: string, category: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('token_tracker')
        .insert([
          {
            user_id: this.currentUser?.id,
            package_type: category,
            unique_id: uuid
          }
        ]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving token tracker:', error);
      throw error;
    }
  }

  async getTokenTracker(): Promise<any[]> {
    try {
      // Wait for user state to be initialized
      if (!this.currentUser?.id) {
        // Wait up to 5 seconds for user state to be ready
        let attempts = 0;
        while (!this.currentUser?.id && attempts < 5) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
        
        if (!this.currentUser?.id) {
          console.warn('User state not initialized after waiting, returning empty array');
          return [];
        }
      }

      const { data, error } = await this.supabase
        .from('token_tracker')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .single();
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting token tracker:', error);
      return [];
    }
  }

  async deleteTokenTracker(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('token_tracker')
        .delete()
        .eq('user_id', this.currentUser?.id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting token tracker:', error);
      return false;
    }
  }

  authChanges(callback: (event: any, session: any) => void) {
    this.supabase.auth.onAuthStateChange(callback);
  }

} 