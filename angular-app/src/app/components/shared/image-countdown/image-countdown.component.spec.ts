import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ImageCountdownComponent } from './image-countdown.component';
import { CountdownService } from '../../../services/image-countdown.service';
import { BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ImageCountdownComponent', () => {
  let component: ImageCountdownComponent;
  let fixture: ComponentFixture<ImageCountdownComponent>;
  let countdownService: jasmine.SpyObj<CountdownService>;
  let countdownSubject: BehaviorSubject<string>;

  beforeEach(async () => {
    countdownSubject = new BehaviorSubject<string>('Ready');
    
    countdownService = jasmine.createSpyObj('CountdownService', ['startCountdown'], {
      countdown$: countdownSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [ImageCountdownComponent],
      providers: [
        { provide: CountdownService, useValue: countdownService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCountdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with Ready state', () => {
      expect(component.countdownText).toBe('Ready');
    });

    it('should start countdown on init', () => {
      component.ngOnInit();
      expect(countdownService.startCountdown).toHaveBeenCalled();
    });
  });

  describe('Countdown Display', () => {
    it('should show Ready status when countdown is Ready', () => {
      countdownSubject.next('Ready');
      fixture.detectChanges();

      const statusText = fixture.debugElement.query(By.css('.countdown p'));
      expect(statusText.nativeElement.textContent).toContain('Image Generation Status: Ready');
    });

    it('should show countdown when not Ready', () => {
      countdownSubject.next('30s');
      fixture.detectChanges();

      const countdownText = fixture.debugElement.query(By.css('.countdown p'));
      expect(countdownText.nativeElement.textContent).toContain('Next Available Image Generation: 30s');
    });

    it('should update display when countdown changes', fakeAsync(() => {
      // Initial state
      countdownSubject.next('Ready');
      fixture.detectChanges();
      expect(component.countdownText).toBe('Ready');

      // Change to counting down
      countdownSubject.next('45s');
      fixture.detectChanges();
      expect(component.countdownText).toBe('45s');

      // Change back to ready
      countdownSubject.next('Ready');
      fixture.detectChanges();
      expect(component.countdownText).toBe('Ready');
    }));
  });

  describe('Subscription Management', () => {
    it('should subscribe to countdown service on init', () => {
      const testValues = ['60s', '30s', 'Ready'];
      
      component.ngOnInit();
      
      testValues.forEach(value => {
        countdownSubject.next(value);
        expect(component.countdownText).toBe(value);
      });
    });
  });
});