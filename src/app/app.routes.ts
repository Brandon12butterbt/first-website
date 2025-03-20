import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GenerateComponent } from './components/generate/generate.component';
import { UpgradeComponent } from './components/upgrade/upgrade.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'generate', component: GenerateComponent },
  { path: 'upgrade', component: UpgradeComponent }
];
