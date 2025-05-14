import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LEGAL_ROUTES } from './routes';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';

@NgModule({
    declarations: [
        PrivacyPolicyComponent,
        TermsOfServiceComponent
    ],
    imports: [
        RouterModule.forChild(LEGAL_ROUTES),
        CommonModule,
        MatCardModule,
        MatDividerModule,
        MatExpansionModule
    ]
})
export class LegalModule { } 