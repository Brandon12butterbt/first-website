import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-signup',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './post-signup.component.html',
  styleUrls: ['./post-signup.component.css']
})
export class PostSignupComponent {
  constructor(private router: Router) {}
}