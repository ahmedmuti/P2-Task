import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, NgClass } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { BeneficiaryService } from '../../core/services/beneficiary.service';
import { Observable, map, take } from 'rxjs';
import { Beneficiary } from '../../core/models/beneficiary.model';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink, AsyncPipe],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']

})
export class HomeComponent {
    authService = inject(AuthService);
    private beneficiaryService = inject(BeneficiaryService);

    featuredBeneficiaries$: Observable<Beneficiary[]>;

    constructor() {
        // Get top 3 approved beneficiaries with highest ratings
        this.featuredBeneficiaries$ = this.beneficiaryService.getApprovedBeneficiaries().pipe(
            map(beneficiaries =>
                [...beneficiaries]
                    .sort((a, b) => b.averageRating - a.averageRating)
                    .slice(0, 3)
            ),
            take(1)
        );
    }
}
