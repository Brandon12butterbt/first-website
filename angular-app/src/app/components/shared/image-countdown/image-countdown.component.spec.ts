import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageCountdownComponent } from './image-countdown.component';
import { CountdownService } from '../../../services/image-countdown.service';
import { of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

describe('ImageCountdownComponent', () => {
  let component: ImageCountdownComponent;
  let fixture: ComponentFixture<ImageCountdownComponent>;
  let mockCountdownService: jasmine.SpyObj<CountdownService>;

  beforeEach(async () => {
    mockCountdownService = jasmine.createSpyObj('CountdownService', ['startCountdown'], {
      countdown$: of('3')
    });

    await TestBed.configureTestingModule({
      imports: [ImageCountdownComponent],
      providers: [
        { provide: CountdownService, useValue: mockCountdownService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCountdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default countdownText', () => {
    expect(component.countdownText).toBeDefined();
  });

  it('should call startCountdown on initialization', () => {
    expect(mockCountdownService.startCountdown).toHaveBeenCalled();
  });

  it('should update countdownText when countdown$ emits a value', () => {
    mockCountdownService.countdown$ = of('3');
    component.ngOnInit();
    
    expect(component.countdownText).toBeDefined();
  });

  it('should show different styling for Ready vs countdown states', () => {
    component.countdownText = 'Ready';
    fixture.detectChanges();
    
    let readyElement = fixture.nativeElement.querySelector('.text-green-400');
    expect(readyElement).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.text-purple-400')).toBeNull();

    component.countdownText = '2';
    fixture.detectChanges();
    
    let countdownElement = fixture.nativeElement.querySelector('.text-purple-400');
    expect(countdownElement).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.text-green-400')).toBeNull();
  });
});