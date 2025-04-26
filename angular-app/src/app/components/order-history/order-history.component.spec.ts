import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OrderHistoryComponent } from './order-history.component';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Session } from '@supabase/supabase-js';

describe('OrderHistoryComponent', () => {
  let component: OrderHistoryComponent;
  let fixture: ComponentFixture<OrderHistoryComponent>;
  let supabaseService: jasmine.SpyObj<SupabaseAuthService>;

  const mockPurchases = [
    {
      id: '1',
      user_id: '123',
      amount: 10,
      price: 1.00,
      stripe_payment_intent_id: 'basic',
      status: 'succeeded',
      created_at: '2025-04-20T10:00:00.000Z'
    },
    {
      id: '2',
      user_id: '123',
      amount: 50,
      price: 4.00,
      stripe_payment_intent_id: 'standard',
      status: 'succeeded',
      created_at: '2025-04-21T10:00:00.000Z'
    },
    {
      id: '3',
      user_id: '123',
      amount: 120,
      price: 8.00,
      stripe_payment_intent_id: 'premium',
      status: 'succeeded',
      created_at: '2025-04-22T10:00:00.000Z'
    }
  ];

  beforeEach(async () => {
    supabaseService = jasmine.createSpyObj('SupabaseAuthService', [
      'getSession',
      'listPurchases'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        OrderHistoryComponent,
        RouterTestingModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatSortModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: SupabaseAuthService, useValue: supabaseService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderHistoryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    const testSession: Session = {
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: { id: '123', email: 'test@test.com' } as any
    };

    it('should load purchases when session exists', fakeAsync(() => {
      supabaseService.getSession.and.resolveTo(testSession);
      supabaseService.listPurchases.and.resolveTo({
        data: mockPurchases,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      component.ngOnInit();
      tick();

      expect(component.allPurchases).toEqual(mockPurchases);
      expect(component.totalItems).toBe(mockPurchases.length);
      expect(component.displayedPurchases.length).toBeLessThanOrEqual(component.pageSize);
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle empty purchases when session exists', fakeAsync(() => {
      supabaseService.getSession.and.resolveTo(testSession);
      supabaseService.listPurchases.and.resolveTo({
        data: [],
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      component.ngOnInit();
      tick();

      expect(component.allPurchases).toEqual([]);
      expect(component.totalItems).toBe(0);
      expect(component.displayedPurchases.length).toBe(0);
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle error when loading purchases', fakeAsync(() => {
      supabaseService.getSession.and.resolveTo(testSession);
      const error = new Error('Failed to load purchases');
      supabaseService.listPurchases.and.rejectWith(error);

      spyOn(console, 'log');

      component.ngOnInit();
      tick();

      expect(console.log).toHaveBeenCalledWith(error);
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('pagination', () => {
    beforeEach(() => {
      component.allPurchases = mockPurchases;
      component.totalItems = mockPurchases.length;

      component.handlePageEvent({
        pageIndex: 0,
        pageSize: component.pageSize,
        length: mockPurchases.length
      });
    });

    it('should handle page size change', () => {
      const event: PageEvent = {
        pageIndex: 0,
        pageSize: 2,
        length: mockPurchases.length
      };

      component.handlePageEvent(event);

      expect(component.pageSize).toBe(2);
      expect(component.displayedPurchases.length).toBe(2);
    });

    it('should handle page navigation', () => {
      component.handlePageEvent({
        pageIndex: 0,
        pageSize: 2,
        length: mockPurchases.length
      });

      const event: PageEvent = {
        pageIndex: 1,
        pageSize: 2,
        length: mockPurchases.length
      };

      component.handlePageEvent(event);

      expect(component.currentPage).toBe(1);
      expect(component.displayedPurchases.length).toBe(1);
    });
  });

  describe('sorting', () => {
    beforeEach(() => {
      component.allPurchases = mockPurchases;

      component.handlePageEvent({
        pageIndex: 0,
        pageSize: component.pageSize,
        length: mockPurchases.length
      });
    });

    it('should sort by date', () => {
      const sort: Sort = { active: 'date', direction: 'desc' };
      component.sortData(sort);
      expect(component.displayedPurchases[0].created_at).toBe('2025-04-22T10:00:00.000Z');
    });

    it('should sort by amount', () => {
      const sort: Sort = { active: 'amount', direction: 'asc' };
      component.sortData(sort);
      expect(component.displayedPurchases[0].amount).toBe(10);
    });

    it('should sort by price', () => {
      const sort: Sort = { active: 'price', direction: 'desc' };
      component.sortData(sort);
      expect(component.displayedPurchases[0].price).toBe(8.00);
    });
  });

  describe('price formatting', () => {
    it('should format price correctly', () => {
      expect(component.formatPrice(1.00)).toBe('$1.00');
      expect(component.formatPrice(10.50)).toBe('$10.50');
      expect(component.formatPrice(0)).toBe('$0.00');
    });
  });
});