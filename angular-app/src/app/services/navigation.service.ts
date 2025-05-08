import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  constructor() {}
  navigateTo(url: string): void {
    window.location.assign(url);
  }
}