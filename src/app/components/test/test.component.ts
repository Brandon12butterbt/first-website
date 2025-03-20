import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="text-center p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold text-purple-400 mb-4">Test Component</h2>
      <p class="text-white mb-6">Router navigation works!</p>
      <a routerLink="/" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
        Back to Home
      </a>
    </div>
  `,
  styles: []
})
export class TestComponent {} 