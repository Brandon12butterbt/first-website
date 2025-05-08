import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountdownService {
  private countdownSubject = new BehaviorSubject<string>('Ready');
  public countdown$ = this.countdownSubject.asObservable();

  startCountdown() {
    const lastRequestTime = localStorage.getItem('lastImageRequest');
    
    if (!lastRequestTime) {
      this.countdownSubject.next('Ready');
      return;
    }

    const now = Date.now();
    const elapsed = now - parseInt(lastRequestTime);
    let remainingTime = Math.max(0, 60000 - elapsed);

    if (remainingTime <= 0) {
      this.countdownSubject.next('Ready');
      return;
    }

    this.updateCountdownDisplay(remainingTime);

    const timer = interval(1000).subscribe(() => {
      remainingTime -= 1000;
      
      if (remainingTime <= 0) {
        this.countdownSubject.next('Ready');
        timer.unsubscribe();
      } else {
        this.updateCountdownDisplay(remainingTime);
      }
    });
  }

  private updateCountdownDisplay(ms: number) {
    const seconds = Math.ceil(ms / 1000);
    this.countdownSubject.next(`${seconds}s`);
  }
}