import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';

import { ConfigService } from './config.service';

// Define interfaces for the Cloudflare API response
interface CloudflareApiResponse {
  result: {
    image: string;
  };
  success: boolean;
}

interface CloudflareApiError {
  errors: Array<{
    message: string;
    code: number;
  }>;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FluxService {
  private apiUrl: string;
  private apiToken: string;
  
  constructor(private http: HttpClient, public config: ConfigService) {
    this.apiUrl = 'https://fragrant-term-2137.brandontbutterworth.workers.dev';
    this.apiToken = this.config.fluxApiKey;
  }
  
  generateImage(prompt: string): Observable<any> {
    const now = Date.now();
    const lastRequestTime = localStorage.getItem('lastImageRequest');

    if (lastRequestTime && now - parseInt(lastRequestTime) < 60000) {
      console.warn('Rate limit hit: You can only generate one image per minute.');
      return of({ error: 'rate_limited', message: 'Rate limit hit: You can only generate one image per minute.' });
    }

    // Store the current timestamp
    localStorage.setItem('lastImageRequest', now.toString());

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    });

    const body = { prompt };

    console.log('Making API request to:', this.apiUrl);
    console.log('With prompt:', prompt);
    
    return this.http.post(this.apiUrl, body, {
      headers,
      responseType: 'blob'
    }).pipe(
      tap(imageBlob => console.log('Image blob received, size:', imageBlob.size)),
      catchError(error => {
        console.error('Error calling Cloudflare worker:', error);
        // Create a fallback image
        const fallbackBlob = new Blob(
          ['R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'], 
          {type: 'image/gif'}
        );
        return of(fallbackBlob);
      }),
      finalize(() => console.log('Image generation request complete'))
    );
  }
  
  imageToImage(prompt: string, image: string): Observable<any> {
    // Cloudflare worker doesn't support image-to-image yet, so we'll just generate a new image
    return this.generateImage(prompt);
  }
} 