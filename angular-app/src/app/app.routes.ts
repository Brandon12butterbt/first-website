import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { GenerateComponent } from './components/generate/generate.component';
import { UpgradeComponent } from './components/upgrade/upgrade.component';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { AuthGuard } from './guards/auth.guard';
import { PaymentGuard } from './guards/payment.guard';
import { AccountDetailsComponent } from './components/account-details/account-details.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { ContactComponent } from './components/contact/contact.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'legal',
    loadChildren: () => import('./components/legal/legal.module').then(m => m.LegalModule)
  },
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'signup', redirectTo: 'auth/signup', pathMatch: 'full' },
  { path: 'post-signup', redirectTo: 'auth/post-signup', pathMatch: 'full' },
  { path: 'expired-signup', redirectTo: 'auth/expired-signup', pathMatch: 'full' },
  { path: 'reset-password', redirectTo: 'auth/reset-password', pathMatch: 'full' },
  { path: 'update-password', redirectTo: 'auth/update-password', pathMatch: 'full' },
  { path: 'privacy-policy', redirectTo: 'legal/privacy-policy', pathMatch: 'full' },
  { path: 'terms-of-service', redirectTo: 'legal/terms-of-service', pathMatch: 'full' },
  { path: '', component: HomeComponent },
  { path: 'gallery', component: GalleryComponent, canActivate: [AuthGuard] },
  { path: 'generate', component: GenerateComponent, canActivate: [AuthGuard] },
  { path: 'upgrade', component: UpgradeComponent, canActivate: [AuthGuard] },
  { path: 'payment-success', component: PaymentSuccessComponent, canActivate: [PaymentGuard] },
  { path: 'account-details', component: AccountDetailsComponent, canActivate: [AuthGuard] },
  { path: 'order-history', component: OrderHistoryComponent, canActivate: [AuthGuard] },
  { path: 'contact', component: ContactComponent, canActivate: [AuthGuard] }
];
