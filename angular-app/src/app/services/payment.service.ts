import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiCallStatus = new BehaviorSubject<boolean>(false);
  
  setApiCallMade(value: boolean) {
    sessionStorage.setItem('apiCallMade', JSON.stringify(value));
  }

  wasApiCallMade(): boolean {
    return JSON.parse(sessionStorage.getItem('apiCallMade') || 'false');
  }
}
