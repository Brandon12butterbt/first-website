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
      console.log('PaymentGuard activated');
      this.paymentService.setApiCallMade(false);
      return true;
    }
    console.log('PaymentGuard deactivated');
    this.router.navigate(['/home']);
    return false;
  }
} 