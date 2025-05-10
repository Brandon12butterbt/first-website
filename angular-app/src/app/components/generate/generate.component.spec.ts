import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GenerateComponent } from './generate.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';

import { FluxService } from '../../services/flux.service';
import { ConfigService } from '../../services/config.service';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { CountdownService } from '../../services/image-countdown.service';

describe('GenerateComponent', () => {
  let component: GenerateComponent;
  let fixture: ComponentFixture<GenerateComponent>;

  let mockFluxService = {
    callGenerateImage: jasmine.createSpy().and.returnValue(of(new Blob()))
  };

  let mockSupabaseAuthService = {
    ensureSessionLoaded: jasmine.createSpy().and.resolveTo({ user: { id: 'user123' } }),
    fluxProfile: jasmine.createSpy().and.resolveTo({ data: { credits: 5, images_generated: 0, id: 'user123' } }),
    imageGeneratedUpdateProfile: jasmine.createSpy().and.resolveTo({}),
    saveGeneratedImage: jasmine.createSpy().and.resolveTo({}),
    triggerAuthChange: jasmine.createSpy()
  };

  let mockCountdownService = {
    countdown$: of('Ready'),
    startCountdown: jasmine.createSpy()
  };

  let mockConfigService = {
    turnWidgetSiteKey: ''
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        ChangeDetectorRef,
        { provide: FluxService, useValue: mockFluxService },
        { provide: SupabaseAuthService, useValue: mockSupabaseAuthService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CountdownService, useValue: mockCountdownService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component and form should be valid when prompt is set', () => {
    expect(component).toBeTruthy();
    component.generateForm.get('prompt')?.setValue('A dragon flying over a mountain at sunset');
    expect(component.generateForm.valid).toBeTrue();
  });

  it('should mark Turnstile as verified if no site key is set', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component.isTurnstileVerified).toBeTrue();
  }));

  it('should disable generation if form is invalid or Turnstile not verified', () => {
    component.turnWidgetSiteKey = 'dummy-key';
    component.isTurnstileVerified = false;
    component.generateForm.get('prompt')?.setValue('Hello');
    expect(component.isFormValid()).toBeFalse();
  });

  it('should allow generation only when verified and prompt is valid', () => {
    component.turnWidgetSiteKey = '';
    component.isTurnstileVerified = true;
    component.generateForm.get('prompt')?.setValue('Generate something cool');
    expect(component.isFormValid()).toBeTrue();
  });

  it('should download blob url image', fakeAsync(() => {
    component.generatedImage = 'blob:test-url';

    const mockLink = document.createElement('a');
    spyOn(document, 'createElement').and.returnValue(mockLink);
    spyOn(mockLink, 'click');
    spyOn(document.body, 'appendChild');
    spyOn(document.body, 'removeChild');

    component.downloadImage();
    tick(100);

    expect(mockLink.href).toBe('blob:test-url');
    expect(mockLink.download).toMatch(/^generated-image-\d+\.png$/);
    expect(mockLink.click).toHaveBeenCalled();
}));

  it('should set Turnstile token and mark as verified on success', () => {
    component.onTurnstileSuccess('mock-token');
    expect(component.isTurnstileVerified).toBeTrue();
    expect(component.generateForm.get('turnstileToken')?.value).toBe('mock-token');
  });
});
