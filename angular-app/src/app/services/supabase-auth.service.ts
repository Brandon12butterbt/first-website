import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';

import { ConfigService } from './config.service';

export interface Profile {
  id?: string
  username: string
  website: string
  avatar_url: string
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseAuthService {
  private supabase: SupabaseClient;
  _session: AuthSession | null = null;
  private authStateCallback: ((event: AuthChangeEvent, session: Session | null) => void) | null = null;

  constructor(private config: ConfigService, private http: HttpClient) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
  }

  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session
    })
    return this._session
  }

  async ensureSessionLoaded(): Promise<AuthSession | null> {
    if (this._session) return this._session;
    const { data } = await this.supabase.auth.getSession();
    this._session = data.session;
    return this._session;
  }

  profile(user: User) {
    return this.supabase
      .from('profiles')
      .select(`id, email`)
      .eq('id', user.id)
      .single()
  }

  fluxProfile(id: string) {
    return this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
  }

  createFluxProfile(id: string, email: string) {
    return this.supabase
      .from('profiles')
      .insert([
        {
          id: id,
          email: email,
          credits: 5,
          images_generated: 0
        }
      ]);
  }

  deleteEntireProfile(id: string): Observable<any> {
    // const url = `http://localhost:3000/admin/delete-user/${id}`;
    const url = `/api/admin/delete-user/${id}`;
    return this.http.delete(url)
    .pipe(
      catchError(error => {
        console.error('Error deleting user:', error);
        return of({ error: 'Failed to delete user' });
      })
    );
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    this.authStateCallback = callback;
    return this.supabase.auth.onAuthStateChange(callback)
  }

  triggerAuthChange(event: AuthChangeEvent, session: Session | null) {
    if (this.authStateCallback) {
      this.authStateCallback(event, session);
    }
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password});
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password});
  }

  resendSignUp(email: string) {
    return this.supabase.auth.resend({  type: 'signup',  email: email,  options: {    emailRedirectTo: 'https://afluxgen.com'  }});
  }

  resetPassword(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://afluxgen.com/auth/update-password' });
  }

  updatePassword(password: string) {
    return this.supabase.auth.updateUser({ password: password });
  }

  fluxImages(id: string) {
    return this.supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false});
  }

  deleteFluxImage(id: string, imageId: string) {
    return this.supabase
        .from('generated_images')
        .delete()
        .eq('id', imageId)
        .eq('user_id', id);
  }

  imageGeneratedUpdateProfile(id: string, imagesGenerated: number, credits: number) {
    return this.supabase
            .from('profiles')
            .update({ 
                images_generated: imagesGenerated + 1,
                credits: credits - 1
            })
            .eq('id', id);
  }

  saveGeneratedImage(id: string, imageUrl: string, prompt: string) {
    return this.supabase
            .from('generated_images')
            .insert([
            {
                user_id: id,
                image_url: imageUrl,
                prompt: prompt
            }
            ]);
  }

  getTokenTracker(id: string) {
    return this.supabase
      .from('token_tracker')
      .select('*')
      .eq('user_id', id)
      .single();
  }

  saveTokenTracker(id: string, category: string, uuid: string) {
    return this.supabase
      .from('token_tracker')
      .insert([
        {
          user_id: id,
          package_type: category,
          unique_id: uuid
        }
      ]);
  }

  deleteTokenTracker(id: string) {
    return this.supabase
      .from('token_tracker')
      .delete()
      .eq('user_id', id);
  }

  deleteTokenPurchases(id: string) {
    return this.supabase
      .from('token_purchases')
      .delete()
      .eq('user_id', id);
  }

  deleteGeneratedImages(id: string) {
    return this.supabase
      .from('generated_images')
      .delete()
      .eq('user_id', id);
  }

  deleteFluxProfile(id: string) {
    return this.supabase
      .from('profiles')
      .delete()
      .eq('user_id', id);
  }

  updateCredits(id: string, credits: number) {
    return this.supabase
      .from('profiles')
      .update({ credits })
      .eq('id', id);
  }

  savePurchase(id: string, tokenTracker: any, creditPackage: any) {
    return this.supabase
      .from('token_purchases')
      .insert([
        {
          user_id: id,
          stripe_payment_intent_id: tokenTracker.data.package_type,
          status: 'succeeded',
          amount: creditPackage?.credits,
          price: creditPackage?.price
        }
      ]);
  }

  listPurchases(id: string) {
    return this.supabase
      .from('token_purchases')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });
  }

  async getSession(): Promise<AuthSession | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  updateProfile(profile: Profile) {
    const update = {
      ...profile,
      updated_at: new Date(),
    }

    return this.supabase.from('profiles').upsert(update)
  }

  downLoadImage(path: string) {
    return this.supabase.storage.from('avatars').download(path)
  }

  uploadAvatar(filePath: string, file: File) {
    return this.supabase.storage.from('avatars').upload(filePath, file)
  }

  
}