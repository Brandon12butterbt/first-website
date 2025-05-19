import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthDataService {
  private signupEmail: string = '';

  constructor() {}

  setSignupEmail(email: string): void {
    this.signupEmail = email;
  }

  getSignupEmail(): string {
    return this.signupEmail;
  }
} 