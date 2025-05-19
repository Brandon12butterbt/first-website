import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { PostSignupComponent } from './post-signup/post-signup.component';
import { UpdatePasswordComponent } from './update-password/update-password.component';
import { ExpiredSignupComponent } from './expired-signup/expired-signup.component';
import { AuthGuard } from '../../guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'post-signup', component: PostSignupComponent },
  { path: 'expired-signup', component: ExpiredSignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'update-password', component: UpdatePasswordComponent, canActivate: [AuthGuard] }
]; 