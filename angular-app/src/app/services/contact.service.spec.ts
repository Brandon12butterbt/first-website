import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ContactService, ContactRequest } from './contact.service';

describe('ContactService', () => {
  let service: ContactService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ContactService]
    });
    service = TestBed.inject(ContactService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have supportEmail property set to afluxgen.help@gmail.com', () => {
    expect((service as any).supportEmail).toEqual('afluxgen.help@gmail.com');
  });

  it('should send contact request and receive success response', () => {
    const mockRequest: ContactRequest = {
      type: 'general',
      description: 'Test description',
      email: 'test@example.com'
    };

    const mockResponse = { success: true, message: 'Email sent successfully' };

    service.sendContactRequest(mockRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:3000/contact');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);

    req.flush(mockResponse);
  });

  it('should handle error response gracefully', () => {
    const mockRequest: ContactRequest = {
      type: 'technical',
      description: 'Simulated failure',
      email: 'fail@example.com'
    };

    service.sendContactRequest(mockRequest).subscribe(response => {
      expect(response).toEqual({ error: 'Failed to contact support' });
    });

    const req = httpMock.expectOne('http://localhost:3000/contact');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });
}); 