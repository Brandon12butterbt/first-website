import { Injectable } from '@angular/core';
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
  private _sessionTest: AuthSession | null = null;

  constructor(private config: ConfigService) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
  }

  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session
    })
    return this._session
  }

  async ensureSessionLoaded(): Promise<AuthSession | null> {
    if (this._sessionTest) return this._sessionTest;
    const { data } = await this.supabase.auth.getSession();
    this._sessionTest = data.session;
    return this._sessionTest;
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
      .single()
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password});
  }

  signOut() {
    return this.supabase.auth.signOut()
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