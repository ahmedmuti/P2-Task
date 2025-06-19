import { Component, inject } from '@angular/core';
import { NgClass, NgFor, NgIf, AsyncPipe, DatePipe, TitleCasePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BeneficiaryService } from '../../core/services/beneficiary.service';
import { Beneficiary } from '../../core/models/beneficiary.model';
import { Observable, catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgClass, RouterLink, AsyncPipe, DatePipe, DecimalPipe],

  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  authService = inject(AuthService);
  private beneficiaryService = inject(BeneficiaryService);

  beneficiaryProfile$: Observable<Beneficiary> | null = null;
  loading = false;
  error = '';

  constructor() {
    // If the user is a beneficiary, load their profile
    if (this.authService.isBeneficiary()) {
      this.loadBeneficiaryProfile();
    }
  }

  loadBeneficiaryProfile(): void {
    this.loading = true;
    this.error = '';

    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      this.error = 'User not found';
      this.loading = false;
      return;
    }

    // For demo purposes, we'll use the user ID as the beneficiary ID
    this.beneficiaryProfile$ = this.beneficiaryService.getBeneficiaryById(currentUser.id).pipe(
      catchError(error => {
        this.error = 'Could not load your beneficiary profile. You may need to create one first.';
        this.loading = false;
        return of();
      }),
      map(beneficiary => {
        this.loading = false;
        return beneficiary;
      })
    );
  }

  logout(): void {
    this.authService.logout();
  }
}
