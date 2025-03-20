import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FluxService {
  private apiUrl = 'https://api.aimlapi.com/v1/images/generations';
  private apiKey = environment.flux.apiKey;
  
  constructor(private http: HttpClient) {
    console.log('Flux API Key initialized (first 5 chars):', this.apiKey.substring(0, 5) + '...');
  }
  
  generateImage(prompt: string, width?: number, height?: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });
    
    const body: any = {
      model: 'flux-pro',
      safety_tolerance: '2',
      prompt: prompt,
      num_images: 1,
      enable_safety_checker: true,
      sync_mode: false
    };
    
    // Use custom width and height if provided, otherwise use landscape_4_3
    if (width && height) {
      body.image_size = {
        width: width,
        height: height
      };
    } else {
      body.image_size = 'landscape_4_3';
    }
    
    console.log('Making API request to Flux with body:', body);
    
    return this.http.post(this.apiUrl, body, { headers }).pipe(
      tap(response => console.log('Flux API response received:', response)),
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
  
  imageToImage(prompt: string, image: string, width?: number, height?: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });
    
    const body: any = {
      model: 'flux-pro',
      safety_tolerance: '2',
      prompt: prompt,
      num_images: 1,
      enable_safety_checker: true,
      sync_mode: false,
      init_image: image
    };
    
    // Use custom width and height if provided, otherwise use landscape_4_3
    if (width && height) {
      body.image_size = {
        width: width,
        height: height
      };
    } else {
      body.image_size = 'landscape_4_3';
    }
    
    return this.http.post(this.apiUrl, body, { headers }).pipe(
      tap(response => console.log('Flux API response received:', response)),
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