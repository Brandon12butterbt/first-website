import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, AuthChangeEvent } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  
  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
    
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.userSubject.next(session?.user || null);
    });
    
    // Try to get initial user
    this.supabase.auth.getSession().then(({ data }) => {
      this.userSubject.next(data.session?.user || null);
    });
  }
  
  get currentUser(): User | null {
    return this.userSubject.value;
  }
  
  async signUp(email: string, password: string): Promise<{ user: User | null; error: any }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });
    
    if (data.user) {
      // Create profile record with default credits
      await this.createProfile(data.user.id);
    }
    
    return { user: data.user, error };
  }
  
  async signIn(email: string, password: string): Promise<{ user: User | null; error: any }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (data.user) {
      // Ensure profile exists
      await this.createProfile(data.user.id);
    }
    
    return { user: data.user, error };
  }
  
  async signOut(): Promise<{ error: any }> {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }
  
  async resetPassword(email: string): Promise<{ error: any }> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    return { error };
  }
  
  async createProfile(userId: string): Promise<void> {
    try {
      // First try to insert a new profile
      const { error: insertError } = await this.supabase
        .from('profiles')
        .insert([
          { 
            user_id: userId, 
            credits: 5,
            images_generated: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      
      // If insert fails because profile exists (conflict), ignore the error
      if (insertError && !insertError.message.includes('duplicate key')) {
        console.error('Error creating profile:', insertError);
      }
    } catch (error) {
      console.error('Unexpected error in createProfile:', error);
    }
  }
  
  async getProfile(): Promise<any> {
    if (!this.currentUser) return null;
    
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .single();
        
      if (error) {
        // Check if it's a "not found" error
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating a new one');
          
          try {
            await this.createProfile(this.currentUser.id);
            
            // Try to fetch the newly created profile
            const { data: newData, error: newError } = await this.supabase
              .from('profiles')
              .select('*')
              .eq('user_id', this.currentUser.id)
              .single();
              
            if (newError) {
              console.error('Error fetching new profile:', newError);
              // Create a fallback profile object if we can't fetch it
              return { credits: 5, images_generated: 0 };
            }
            
            return newData;
          } catch (createError) {
            console.error('Error creating profile:', createError);
            // Return a fallback profile if creation fails
            return { credits: 5, images_generated: 0 };
          }
        } else {
          console.error('Error fetching profile:', error);
          // Return a default profile for other errors
          return { credits: 5, images_generated: 0 };
        }
      }
      
      return data;
    } catch (unexpectedError) {
      console.error('Unexpected error in getProfile:', unexpectedError);
      // Return a fallback profile for unexpected errors
      return { credits: 5, images_generated: 0 };
    }
  }
  
  async updateCredits(credits: number): Promise<void> {
    if (!this.currentUser) return;
    
    await this.supabase
      .from('profiles')
      .update({ credits })
      .eq('user_id', this.currentUser.id);
  }
  
  async incrementImagesGenerated(): Promise<void> {
    if (!this.currentUser) return;
    
    const profile = await this.getProfile();
    if (!profile) return;
    
    await this.supabase
      .from('profiles')
      .update({ 
        images_generated: (profile.images_generated || 0) + 1,
        credits: profile.credits - 1 
      })
      .eq('user_id', this.currentUser.id);
  }
  
  async saveGeneratedImage(imageUrl: string, prompt: string): Promise<void> {
    if (!this.currentUser) return;
    
    await this.supabase
      .from('generated_images')
      .insert([
        { 
          user_id: this.currentUser.id, 
          image_url: imageUrl,
          prompt,
          created_at: new Date().toISOString()
        }
      ]);
  }
  
  async getGeneratedImages(): Promise<any[]> {
    if (!this.currentUser) return [];
    
    try {
      const { data, error } = await this.supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.warn('Error fetching images, using mock data:', error);
        
        // Return mock data for testing purposes
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching images:', error);
      
      // Return empty array for any errors
      return [];
    }
  }
} 