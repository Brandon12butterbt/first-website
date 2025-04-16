import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountdownService } from '../../../services/image-countdown.service';

@Component({
    selector: 'app-image-countdown-timer',
    standalone: true,
    imports: [
      CommonModule
    ],
    templateUrl: './image-countdown.component.html',
    styleUrls: ['./image-countdown.component.css']
  })
  export class ImageCountdownComponent {
    
    countdownText = 'Ready';

    constructor(private countdownService: CountdownService) {}

    ngOnInit() {
      this.countdownService.countdown$.subscribe(text => {
        this.countdownText = text;
      });
      
      this.countdownService.startCountdown();
    }
  } 