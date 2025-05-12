import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { SupabaseAuthService } from '../../services/supabase-auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

interface Purchase {
  id: string;
  user_id: string;
  amount: number;
  price: number;
  stripe_payment_intent_id: string;
  status: string;
  created_at: string;
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class OrderHistoryComponent implements OnInit {
  allPurchases: Purchase[] = [];
  displayedPurchases: Purchase[] = [];
  isLoading = true;
  session: any = null;

  pageSize = 5;
  currentPage = 0;
  totalItems = 0;

  constructor(private supabaseAuthService: SupabaseAuthService) {}

  async ngOnInit() {
    this.isLoading = true;

    const loadingTimeout = setTimeout(() => {
      if (this.isLoading) {
        console.warn('Timeout reached: forcing isLoading = false');
        this.isLoading = false;
      }
    }, 8000);

    const session = await this.supabaseAuthService.getSession();
    this.session = session;

    if (session) {
      await this.getPurchases(session);
    } else {
      this.allPurchases = [];
    }

    clearTimeout(loadingTimeout);
    this.isLoading = false;
  }

  async getPurchases(session: any) {
    try {
      const { user } = session;
      console.log('Fetching purchases for user:', user.id);
      const { data: purchases, error } = await this.supabaseAuthService.listPurchases(user.id);
      if (error) {
        throw error;
      }
      if (purchases) {
        this.allPurchases = purchases;
        this.totalItems = purchases.length;
        this.updateDisplayedPurchases();
      }

      console.log('Purchases:', this.allPurchases);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
      }
    } finally {
      this.isLoading = false;
    }
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  handlePageEvent(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedPurchases();
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      this.displayedPurchases = this.allPurchases.slice(
        this.currentPage * this.pageSize,
        (this.currentPage + 1) * this.pageSize
      );
      return;
    }

    this.allPurchases.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'date':
          return compare(new Date(a.created_at), new Date(b.created_at), isAsc);
        case 'amount':
          return compare(a.amount, b.amount, isAsc);
        case 'price':
          return compare(a.price, b.price, isAsc);
        default:
          return 0;
      }
    });

    this.updateDisplayedPurchases();
  }

  private updateDisplayedPurchases() {
    const startIndex = this.currentPage * this.pageSize;
    this.displayedPurchases = this.allPurchases.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }
}

function compare(a: number | Date, b: number | Date, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
