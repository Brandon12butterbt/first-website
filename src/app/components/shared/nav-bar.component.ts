import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar class="bg-gray-800 border-b border-gray-700">
      <div class="container mx-auto flex items-center justify-center">
        <a routerLink="/home" class="text-xl font-bold text-purple-400 mr-6 select-none cursor-pointer">AFluxGen</a>
        
        <button mat-button routerLink="/gallery" class="text-white hover:bg-gray-700 mx-2">
          <mat-icon>dashboard</mat-icon>
          <span class="ml-1">Gallery</span>
        </button>
        
        <button mat-button routerLink="/generate" class="text-white hover:bg-gray-700 mx-2">
          <mat-icon>add_photo_alternate</mat-icon>
          <span class="ml-1">Generate</span>
        </button>
        
        <div class="px-2 py-0.5 bg-gray-700 rounded-full flex items-center mx-2 text-sm">
          <mat-icon class="text-yellow-400 mr-1" style="font-size: 16px; height: 16px; width: 16px; line-height: 16px;">stars</mat-icon>
          <span class="text-white select-none">{{ profile?.credits || 0 }} credits</span>
        </div>
        
        <button mat-button [matMenuTriggerFor]="userMenu" class="text-white hover:bg-gray-700 mx-2">
          <mat-icon>account_circle</mat-icon>
          <span class="ml-1">{{ userEmail }}</span>
        </button>
        
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/upgrade">
            <mat-icon>upgrade</mat-icon>
            <span>Upgrade</span>
          </button>
          <button mat-menu-item (click)="signOutClicked()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Sign out</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .select-none {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }
  `]
})
export class NavBarComponent {
  @Input() userEmail: string = '';
  @Input() profile: any = null;
  @Output() signOut = new EventEmitter<void>();
  
  signOutClicked(): void {
    this.signOut.emit();
  }
} 