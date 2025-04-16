import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userEmail: string = '';
  profile: any = null;
  
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}
  
  ngOnInit() {
    console.log("Home page init called");
    this.loadUserData();
  }
  
  async loadUserData() {
    const user = this.supabaseService.currentUser;
    console.log('user', user);
    this.userEmail = user?.email || '';
    this.profile = user;
    if (!user) {
      console.log('user null, pulling data');
      this.profile = await this.supabaseService.getProfile();
      this.userEmail = this.profile.email;
      console.log('profile', this.profile);
    }
  }
} 