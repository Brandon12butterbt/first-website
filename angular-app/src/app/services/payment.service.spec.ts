import { TestBed } from '@angular/core/testing';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentService);
    spyOn(sessionStorage, 'setItem');
    spyOn(sessionStorage, 'getItem');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set apiCallMade to true in sessionStorage', () => {
    service.setApiCallMade(true);
    expect(sessionStorage.setItem).toHaveBeenCalledWith('apiCallMade', 'true');
  });

  it('should set apiCallMade to false in sessionStorage', () => {
    service.setApiCallMade(false);
    expect(sessionStorage.setItem).toHaveBeenCalledWith('apiCallMade', 'false');
  });

  it('should return true when apiCallMade is true', () => {
    (sessionStorage.getItem as jasmine.Spy).and.returnValue('true');
    expect(service.wasApiCallMade()).toBeTrue();
  });

  it('should return false when apiCallMade is false or missing', () => {
    (sessionStorage.getItem as jasmine.Spy).and.returnValue('false');
    expect(service.wasApiCallMade()).toBeFalse();

    (sessionStorage.getItem as jasmine.Spy).and.returnValue(null);
    expect(service.wasApiCallMade()).toBeFalse();
  });
});
