import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { PostSignupComponent } from './components/auth/post-signup/post-signup.component';
import { HomeComponent } from './components/home/home.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { GenerateComponent } from './components/generate/generate.component';
import { UpgradeComponent } from './components/upgrade/upgrade.component';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { AuthGuard } from './guards/auth.guard';
import { PaymentGuard } from './guards/payment.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'post-signup', component: PostSignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '', component: HomeComponent },
  { path: 'gallery', component: GalleryComponent, canActivate: [AuthGuard] },
  { path: 'generate', component: GenerateComponent, canActivate: [AuthGuard] },
  { path: 'upgrade', component: UpgradeComponent, canActivate: [AuthGuard] },
  { path: 'payment-success', component: PaymentSuccessComponent, canActivate: [PaymentGuard] }
];
