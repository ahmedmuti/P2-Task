import { DatePipe, DecimalPipe, NgClass, NgFor } from '@angular/common';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, Subscription, catchError, map, of, switchMap, tap } from 'rxjs';
import { Beneficiary } from '../../../core/models/beneficiary.model';
import { AuthService } from '../../../core/services/auth.service';
import { BeneficiaryService } from '../../../core/services/beneficiary.service';

@Component({
  selector: 'app-beneficiary-detail',
  standalone: true,
  imports: [NgClass, NgFor, RouterLink, ReactiveFormsModule, DatePipe, DecimalPipe],
  templateUrl: './beneficiary-detail.component.html',
  styleUrls: ['./beneficiary-detail.component.scss']
})
export class BeneficiaryDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private beneficiaryService = inject(BeneficiaryService);
  private fb = inject(FormBuilder);
  authService = inject(AuthService);

  beneficiary: Beneficiary | null = null;
  loading = true;
  error = '';
  private beneficiarySubscription!: Subscription;

  // Rating form
  ratingForm: FormGroup;
  ratingValue = 0;
  submitted = false;
  submittingRating = false;
  ratingSuccess = false;
  ratingError = '';

  // Approval
  approving = false;

  @ViewChild('ratingInput') ratingInput!: ElementRef;

  constructor() {
    this.ratingForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['']
    });
  }

  ngOnInit(): void {
    console.log('Detail component initialized - starting data fetch');
    this.loadBeneficiary();
  }

  ngOnDestroy(): void {
    if (this.beneficiarySubscription) {
      this.beneficiarySubscription.unsubscribe();
    }
  }

  loadBeneficiary(): void {
    this.loading = true;
    this.error = '';
    console.log('Detail loading set to true');

    // Unsubscribe from previous subscription if exists
    if (this.beneficiarySubscription) {
      this.beneficiarySubscription.unsubscribe();
    }

    const beneficiaryData$ = this.route.paramMap.pipe(
      map(params => params.get('id') || ''),
      tap(id => console.log('Detail component - received ID:', id)),
      switchMap(id => {
        if (!id) {
          throw new Error('Beneficiary ID is required');
        }
        console.log('Detail component - fetching beneficiary with ID:', id);
        return this.beneficiaryService.getBeneficiaryById(id).pipe(
          tap(beneficiary => console.log('Detail component - received beneficiary data:', beneficiary))
        );
      }),
      catchError(error => {
        console.error('Detail component - error fetching beneficiary:', error);
        this.loading = false;
        this.error = error.message || 'Failed to load beneficiary details';
        return of(null);
      })
    );
    
    this.beneficiarySubscription = beneficiaryData$.subscribe({
      next: (data) => {
        this.beneficiary = data;
        this.loading = false;
        this.ratingSuccess = false;
        this.ratingError = '';
        console.log('Detail component - subscription received data, loading set to false');
      },
      error: (error) => {
        console.error('Detail component - subscription error:', error);
        this.loading = false;
        this.error = error.message || 'Failed to load beneficiary details';
        this.beneficiary = null;
      }
    });
    
    // Fallback to set loading to false after a timeout in case service hangs
    setTimeout(() => {
      if (this.loading) {
        console.log('Detail component - timeout triggered - setting loading to false');
        this.loading = false;
      }
    }, 5000);
  }

  setRating(value: number): void {
    this.ratingValue = value;
    this.ratingForm.patchValue({ rating: value });
  }

  submitRating(beneficiaryId: string): void {
    this.submitted = true;
    this.ratingSuccess = false;
    this.ratingError = '';

    if (this.ratingForm.invalid) {
      return;
    }

    this.submittingRating = true;

    const { rating, comment } = this.ratingForm.value;

    this.beneficiaryService.rateBeneficiary(beneficiaryId, rating, comment).subscribe({
      next: () => {
        this.submittingRating = false;
        this.ratingSuccess = true;
        this.ratingForm.reset({ rating: 0, comment: '' });
        this.ratingValue = 0;
        this.submitted = false;

        // Reload the beneficiary to get updated ratings
        this.loadBeneficiary();
      },
      error: error => {
        this.submittingRating = false;
        this.ratingError = error.message || 'Failed to submit rating';
      }
    });
  }

  approveBeneficiary(id: string): void {
    this.approving = true;

    this.beneficiaryService.approveBeneficiary(id).subscribe({
      next: () => {
        this.approving = false;
        // Reload the beneficiary to get updated status
        this.loadBeneficiary();
      },
      error: error => {
        this.approving = false;
        this.error = error.message || 'Failed to approve beneficiary';
      }
    });
  }
}
