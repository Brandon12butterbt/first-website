import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  navigateTo(url: string): void {
    window.location.href = url;
  }
}