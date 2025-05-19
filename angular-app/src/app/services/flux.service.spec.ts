import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FluxService } from './flux.service';
import { ConfigService } from './config.service';
import { CountdownService } from './image-countdown.service';

describe('FluxService', () => {
  let service: FluxService;
  let httpMock: HttpTestingController;
  let mockCountdownService: jasmine.SpyObj<CountdownService>;

  beforeEach(() => {
    mockCountdownService = jasmine.createSpyObj('CountdownService', ['startCountdown']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FluxService,
        { provide: ConfigService, useValue: {} },
        { provide: CountdownService, useValue: mockCountdownService }
      ]
    });

    service = TestBed.inject(FluxService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call API and return image blob when prompt is valid and not rate-limited', (done) => {
    const prompt = 'a sunny beach';
    const fakeBlob = new Blob(['fake-image'], { type: 'image/png' });

    service.callGenerateImage(prompt).subscribe(response => {
      expect(response).toEqual(fakeBlob);
      expect(mockCountdownService.startCountdown).toHaveBeenCalled();
      done();
    });

    const req = httpMock.expectOne('/api/generate-image');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ prompt });

    req.flush(fakeBlob);
  });

  it('should return rate limit error if called within 60 seconds', () => {
    const prompt = 'an image';
    const now = Date.now();
    localStorage.setItem('lastImageRequest', now.toString());

    const result$ = service.callGenerateImage(prompt);

    result$.subscribe(response => {
      expect(response).toEqual({
        error: 'rate_limited',
        message: 'Rate limit hit: You can only generate one image per minute.'
      });
      expect(mockCountdownService.startCountdown).not.toHaveBeenCalled();
    });
  });

  it('should return fallback blob on HTTP error', (done) => {
    const prompt = 'an error prompt';

    service.callGenerateImage(prompt).subscribe(response => {
      expect(response instanceof Blob).toBeTrue();
      expect(mockCountdownService.startCountdown).toHaveBeenCalled();
      done();
    });

    const req = httpMock.expectOne('/api/generate-image');
    req.error(new ProgressEvent('Network error'));
  });
});
