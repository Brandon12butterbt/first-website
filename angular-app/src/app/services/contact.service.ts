import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ContactRequest {
  type: string;
  description: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(private http: HttpClient) { }
  
  sendContactRequest(request: ContactRequest): Observable<any> {
    // const url = 'http://localhost:3000/generate-image';
    const url = '/api/contact';
    return this.http.post(url, request)
    .pipe(
      catchError(error => {
        console.error('Error contacting support:', error);
        return of({ error: 'Failed to contact support' });
      })
    );
  }
} 