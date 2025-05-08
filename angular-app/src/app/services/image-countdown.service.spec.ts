import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CountdownService } from './image-countdown.service';

describe('CountdownService', () => {
  let service: CountdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CountdownService);
    localStorage.clear();
  });

  it('should emit "Ready" if no lastImageRequest is found', () => {
    const values: string[] = [];
    service.countdown$.subscribe(val => values.push(val));

    service.startCountdown();

    expect(values[values.length - 1]).toBe('Ready');
  });

  it('should emit "Ready" immediately if timer has expired', () => {
    const now = Date.now() - 61000; // More than 60s ago
    localStorage.setItem('lastImageRequest', now.toString());

    const values: string[] = [];
    service.countdown$.subscribe(val => values.push(val));

    service.startCountdown();

    expect(values[values.length - 1]).toBe('Ready');
  });

  it('should emit countdown values and "Ready" at the end', fakeAsync(() => {
    const now = Date.now();
    localStorage.setItem('lastImageRequest', (now - 5000).toString()); // 5s ago

    const emittedValues: string[] = [];
    const sub = service.countdown$.subscribe(val => emittedValues.push(val));

    service.startCountdown();
    tick(60000); // simulate passage of time

    expect(emittedValues[0]).toBe('Ready');
    sub.unsubscribe();
  }));
});
