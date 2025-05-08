import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EnvironmentService } from './environment.service';

describe('EnvironmentService', () => {
  let service: EnvironmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EnvironmentService]
    });

    service = TestBed.inject(EnvironmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensures no unmatched requests
  });

  it('should fetch environment variables from /api/env', () => {
    const mockResponse = {
      SUPABASE_URL: 'https://supabase.example.com',
      SUPABASE_ANON_KEY: 'anon-key',
    };

    service.getEnvVars().subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/env');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
