import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AUTH_ROUTES } from './routes';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SignupComponent } from './signup/signup.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { PostSignupComponent } from './post-signup/post-signup.component';
import { LoginComponent } from './login/login.component';
import { UpdatePasswordComponent } from './update-password/update-password.component';

@NgModule({
    declarations: [
        SignupComponent, 
        ResetPasswordComponent, 
        PostSignupComponent, 
        LoginComponent, 
        UpdatePasswordComponent
    ],
    imports: [
        RouterModule.forChild(AUTH_ROUTES),
        CommonModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatFormFieldModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatDividerModule,
        MatSnackBarModule
    ]
})
export class AuthModule { } 