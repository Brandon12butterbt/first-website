import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ConfigService } from './config.service';
import { CountdownService } from './image-countdown.service';


@Injectable({
  providedIn: 'root'
})
export class FluxService {
  
  constructor(private http: HttpClient, public config: ConfigService, private countdownService: CountdownService) {}

  callGenerateImage(prompt: string): Observable<any> {
    const now = Date.now();
    const lastRequestTime = localStorage.getItem('lastImageRequest');

    if (lastRequestTime && now - parseInt(lastRequestTime) < 60000) {
      console.warn('Rate limit hit: You can only generate one image per minute.');
      return of({ error: 'rate_limited', message: 'Rate limit hit: You can only generate one image per minute.' });
    }

    localStorage.setItem('lastImageRequest', now.toString());
    this.countdownService.startCountdown();

    const body = { prompt };

    // const url = 'http://localhost:3000/generate-image';
    const url = '/api/generate-image';

    return this.http.post(url, body, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('Error calling backend API:', error);
        const fallbackBlob = new Blob(
          ['R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'], 
          { type: 'image/gif' }
        );
        return of(fallbackBlob);
      })
    );
  }
} 