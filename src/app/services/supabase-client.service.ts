import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SupabaseClientService {
  private static instance: SupabaseClient;
  private sessionSubject = new BehaviorSubject<Session | null>(null);
  private sessionInitialized = false;
  session$ = this.sessionSubject.asObservable();
  
  constructor() {
    if (!SupabaseClientService.instance) {
      SupabaseClientService.instance = createClient(
        environment.supabase.url,
        environment.supabase.anonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: 'sb-auth-token',
            storage: {
              getItem: (key) => {
                try {
                  return localStorage.getItem(key);
                } catch (error) {
                  return null;
                }
              },
              setItem: (key, value) => {
                try {
                  localStorage.setItem(key, value);
                } catch (error) {
                  // Ignore storage errors
                }
              },
              removeItem: (key) => {
                try {
                  localStorage.removeItem(key);
                } catch (error) {
                  // Ignore storage errors
                }
              }
            }
          },
          global: {
            headers: {
              'x-application-name': 'image-generator'
            }
          }
        }
      );

      this.initializeSession();
    }
  }

  private async initializeSession() {
    try {
      try {
        const hasToken = !!localStorage.getItem('sb-auth-token');
        if (!hasToken) {
          this.sessionSubject.next(null);
          this.sessionInitialized = true;
          return;
        }
      } catch (e) {
        // Ignore localStorage errors
      }
      
      const { data: { session }, error } = await SupabaseClientService.instance.auth.getSession();
      if (error) throw error;
      
      this.sessionSubject.next(session);
      
      SupabaseClientService.instance.auth.onAuthStateChange((_event, session) => {
        this.sessionSubject.next(session);
      });

      this.sessionInitialized = true;
    } catch (error) {
      this.sessionSubject.next(null);
      this.sessionInitialized = true;
    }
  }

  get client(): SupabaseClient {
    return SupabaseClientService.instance;
  }

  get currentSession(): Session | null {
    return this.sessionSubject.value;
  }

  waitForSession(): Observable<Session | null> {
    return this.session$.pipe(
      filter(() => this.sessionInitialized),
      take(1)
    );
  }
} 