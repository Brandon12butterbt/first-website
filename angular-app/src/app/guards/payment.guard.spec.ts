import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PaymentGuard } from './payment.guard';
import { PaymentService } from '../services/payment.service';

describe('PaymentGuard', () => {
  let guard: PaymentGuard;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockPaymentService: jasmine.SpyObj<PaymentService>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockPaymentService = jasmine.createSpyObj('PaymentService', [
      'wasApiCallMade',
      'setApiCallMade'
    ]);

    TestBed.configureTestingModule({
      providers: [
        PaymentGuard,
        { provide: Router, useValue: mockRouter },
        { provide: PaymentService, useValue: mockPaymentService }
      ]
    });

    guard = TestBed.inject(PaymentGuard);
  });

  it('should return true and reset flag if API call was made', () => {
    mockPaymentService.wasApiCallMade.and.returnValue(true);

    const result = guard.canActivate();

    expect(result).toBeTrue();
    expect(mockPaymentService.setApiCallMade).toHaveBeenCalledWith(false);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should return false and navigate if API call was not made', () => {
    mockPaymentService.wasApiCallMade.and.returnValue(false);

    const result = guard.canActivate();

    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    expect(mockPaymentService.setApiCallMade).not.toHaveBeenCalled();
  });
});
