import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  constructor(private http: HttpClient) {}

  getEnvVars() {
    return this.http.get<any>('http://localhost:3000/env');
  }
}