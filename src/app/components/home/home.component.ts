import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from '../shared/nav-bar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterModule,
    NavBarComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-900 flex flex-col">
      <!-- Top Navigation -->
      <app-nav-bar [userEmail]="userEmail" [profile]="profile" (signOut)="signOut()"></app-nav-bar>
      
      <!-- Main Content -->
      <div class="flex-1 p-6 md:p-12">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl md:text-4xl font-bold text-white mb-4">Hello, I'm Brandon</h1>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div class="md:col-span-2">
              <mat-card class="bg-gray-800 p-6 h-full">
                <h2 class="text-xl font-semibold text-purple-400 mb-4">Software & DevOps Engineer</h2>
                <p class="text-gray-300 mb-4">
                  I'm passionate about creating innovative software solutions and optimizing development workflows.
                  With extensive experience in both software development and DevOps practices, I bridge the gap between
                  development and operations to deliver high-quality, scalable applications.
                </p>
                <p class="text-gray-300 mb-4">
                  My expertise spans across cloud infrastructure, CI/CD pipelines, containerization, and 
                  modern application development. I enjoy tackling complex problems and finding elegant solutions
                  that improve efficiency and reliability.
                </p>
                <div class="mt-6">
                  <button mat-raised-button color="primary" routerLink="/generate" class="bg-purple-600 hover:bg-purple-700 mr-4">
                    <mat-icon class="text-white">add_photo_alternate</mat-icon>
                    <span class="text-white">Generate AI Art</span>
                  </button>
                  <button mat-raised-button color="accent" routerLink="/gallery" class="bg-purple-600 hover:bg-purple-700">
                    <mat-icon class="text-white">dashboard</mat-icon>
                    <span class="text-white">View Gallery</span>
                  </button>
                </div>
              </mat-card>
            </div>
            
            <div>
              <mat-card class="bg-gray-800 p-6 h-full">
                <h2 class="text-xl font-semibold text-purple-400 mb-4">Tech Stack</h2>
                <div class="grid grid-cols-2 gap-2">
                  <div class="bg-gray-700 p-2 rounded flex items-center">
                    <mat-icon class="text-blue-400 mr-2">code</mat-icon>
                    <span class="text-gray-200">Angular</span>
                  </div>
                  <div class="bg-gray-700 p-2 rounded flex items-center">
                    <mat-icon class="text-green-400 mr-2">dns</mat-icon>
                    <span class="text-gray-200">Node.js</span>
                  </div>
                  <div class="bg-gray-700 p-2 rounded flex items-center">
                    <mat-icon class="text-yellow-400 mr-2">cloud</mat-icon>
                    <span class="text-gray-200">AWS</span>
                  </div>
                  <div class="bg-gray-700 p-2 rounded flex items-center">
                    <mat-icon class="text-blue-300 mr-2">integration_instructions</mat-icon>
                    <span class="text-gray-200">Docker</span>
                  </div>
                  <div class="bg-gray-700 p-2 rounded flex items-center">
                    <mat-icon class="text-red-400 mr-2">trending_up</mat-icon>
                    <span class="text-gray-200">CI/CD</span>
                  </div>
                  <div class="bg-gray-700 p-2 rounded flex items-center">
                    <mat-icon class="text-purple-300 mr-2">storage</mat-icon>
                    <span class="text-gray-200">Databases</span>
                  </div>
                </div>
              </mat-card>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <mat-card class="bg-gray-800 p-6">
              <h2 class="text-xl font-semibold text-purple-400 mb-4">What I Do</h2>
              <ul class="text-gray-300 space-y-3">
                <li class="flex items-start">
                  <mat-icon class="text-green-400 mr-2 mt-1">check_circle</mat-icon>
                  <span>Develop full-stack web applications with modern frameworks</span>
                </li>
                <li class="flex items-start">
                  <mat-icon class="text-green-400 mr-2 mt-1">check_circle</mat-icon>
                  <span>Design and implement CI/CD pipelines for automated deployment</span>
                </li>
                <li class="flex items-start">
                  <mat-icon class="text-green-400 mr-2 mt-1">check_circle</mat-icon>
                  <span>Configure and manage cloud infrastructure with IaC</span>
                </li>
                <li class="flex items-start">
                  <mat-icon class="text-green-400 mr-2 mt-1">check_circle</mat-icon>
                  <span>Containerize applications for consistent deployment</span>
                </li>
                <li class="flex items-start">
                  <mat-icon class="text-green-400 mr-2 mt-1">check_circle</mat-icon>
                  <span>Implement monitoring and logging solutions</span>
                </li>
              </ul>
            </mat-card>
            
            <mat-card class="bg-gray-800 p-6">
              <h2 class="text-xl font-semibold text-purple-400 mb-4">My Projects</h2>
              <div class="space-y-4">
                <div class="border-l-4 border-purple-500 pl-4">
                  <h3 class="text-white font-medium">AFluxGen AI</h3>
                  <p class="text-gray-400 text-sm">AI-powered image generation platform featuring a modern UI and cloud infrastructure.</p>
                </div>
                <div class="border-l-4 border-blue-500 pl-4">
                  <h3 class="text-white font-medium">DevOps Pipeline Toolkit</h3>
                  <p class="text-gray-400 text-sm">Custom CI/CD toolkit for streamlining development workflows and deployments.</p>
                </div>
                <div class="border-l-4 border-green-500 pl-4">
                  <h3 class="text-white font-medium">Cloud Migration Framework</h3>
                  <p class="text-gray-400 text-sm">Framework for migrating legacy applications to modern cloud infrastructure.</p>
                </div>
              </div>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  userEmail: string = '';
  profile: any = null;
  
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadUserData();
  }
  
  async loadUserData() {
    const user = this.supabaseService.currentUser;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.userEmail = user.email || '';
    this.profile = await this.supabaseService.getProfile();
  }
  
  async signOut() {
    await this.supabaseService.signOut();
    this.router.navigate(['/login']);
  }
} 