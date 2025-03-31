import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { PaymentService } from '../services/payment.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentGuard implements CanActivate {
  constructor(
    private router: Router,
    private paymentService: PaymentService
  ) {}

  canActivate(): boolean {
    if (this.paymentService.wasApiCallMade()) {
      this.paymentService.setApiCallMade(false);
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
} 