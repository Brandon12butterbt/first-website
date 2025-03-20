import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FluxService {
  private apiUrl = 'https://api.flux.ai/v1/images/generations';
  private apiKey = environment.flux.apiKey;
  
  constructor(private http: HttpClient) {
    console.log('Flux API Key initialized (first 5 chars):', this.apiKey.substring(0, 5) + '...');
  }
  
  generateImage(prompt: string, negativePrompt: string = '', width: number = 1024, height: number = 1024): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });
    
    const body = {
      prompt,
      negative_prompt: negativePrompt,
      width,
      height,
      num_images: 1,
      model: 'flux-1'
    };
    
    console.log('Making direct API request to Flux');
    
    return this.http.post(this.apiUrl, body, { headers }).pipe(
      tap(response => console.log('Flux API response received')),
      catchError(error => {
        console.error('Error calling Flux API:', error);
        
        // If API call fails, use a placeholder image
        return of({
          images: [{
            url: 'https://via.placeholder.com/1024x1024/3a3a3a/FFFFFF?text=Generated+Image',
            seed: 0,
            id: 'placeholder'
          }]
        });
      })
    );
  }
  
  imageToImage(prompt: string, image: string, negativePrompt: string = '', width: number = 1024, height: number = 1024, strength: number = 0.7): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });
    
    const body = {
      prompt,
      negative_prompt: negativePrompt,
      width,
      height,
      num_images: 1,
      model: 'flux-1',
      strength,
      init_image: image
    };
    
    return this.http.post(this.apiUrl, body, { headers }).pipe(
      tap(response => console.log('Flux API response received')),
      catchError(error => {
        console.error('Error calling Flux API:', error);
        
        // If API call fails, use a placeholder image
        return of({
          images: [{
            url: 'https://via.placeholder.com/1024x1024/3a3a3a/FFFFFF?text=Edited+Image',
            seed: 0,
            id: 'placeholder'
          }]
        });
      })
    );
  }
} 