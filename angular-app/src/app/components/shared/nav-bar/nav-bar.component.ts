import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  animations: [
    trigger('mobileMenuAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-5px)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-5px)' }))
      ])
    ])
  ]
})
export class NavBarComponent {
  @Input() userEmail: string = '';
  @Input() profile: any = null;
  @Output() signOut = new EventEmitter<void>();
  
  isMobileMenuOpen = false;
  isUserDropdownOpen = false;
  
  constructor(private elementRef: ElementRef) {}
  
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isUserDropdownOpen = false;
    }
  }
  
  @HostListener('document:keydown.escape', ['$event'])
  onEscapePressed() {
    this.closeAllMenus();
  }
  
  onDropdownMouseLeave() {
    this.isUserDropdownOpen = false;
  }
  
  signOutClicked(): void {
    this.signOut.emit();
    this.closeAllMenus();
  }
  
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isUserDropdownOpen = false;
    }
  }
  
  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }
  
  closeAllMenus(): void {
    this.isMobileMenuOpen = false;
    this.isUserDropdownOpen = false;
  }
}