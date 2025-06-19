import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, AsyncPipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BeneficiaryService } from '../../../core/services/beneficiary.service';
import { Beneficiary } from '../../../core/models/beneficiary.model';
import { Observable, catchError, map, of, startWith, switchMap, tap, Subject, Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-beneficiary-list',
  standalone: true,
  imports: [RouterLink, FormsModule, NgClass, AsyncPipe, NgIf, NgFor],
  templateUrl: './beneficiary-list.component.html',
  styleUrls: ['./beneficiary-list.component.scss']

})
export class BeneficiaryListComponent implements OnInit, OnDestroy {
  private beneficiaryService = inject(BeneficiaryService);
  authService = inject(AuthService);
  private router = inject(Router);

  beneficiaries: Beneficiary[] = [];
  loading = true;
  searchTerm = '';
  sortField = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchSubject = new Subject<{ term: string; field: string; direction: 'asc' | 'desc' }>();
  private navigationSubscription!: Subscription;
  private beneficiariesSubscription!: Subscription;

  ngOnInit(): void {
    console.log('Component initialized - starting data fetch');
    this.initBeneficiariesStream();

    // Listen for navigation events to reinitialize data on reload
    this.navigationSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url.includes('/beneficiaries')) {
        console.log('Navigation to beneficiaries detected - reinitializing data');
        this.initBeneficiariesStream();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
    if (this.beneficiariesSubscription) {
      this.beneficiariesSubscription.unsubscribe();
    }
  }

  private initBeneficiariesStream(): void {
    // Unsubscribe from previous subscription if exists
    if (this.beneficiariesSubscription) {
      this.beneficiariesSubscription.unsubscribe();
    }

    const searchParams$ = this.searchSubject.pipe(
      startWith({ term: this.searchTerm, field: this.sortField, direction: this.sortDirection }),
      tap(params => console.log('Search params updated:', params))
    );

    this.loading = true;
    console.log('Loading set to true');

    const beneficiaries$ = searchParams$.pipe(
      tap(() => console.log('Processing search params')),
      switchMap(params => {
        console.log('Fetching beneficiaries with params:', params);
        return this.beneficiaryService.getApprovedBeneficiaries().pipe(
          tap(beneficiaries => console.log('Raw beneficiaries data received:', beneficiaries)),
          map(beneficiaries => {
            const filteredBeneficiaries = beneficiaries.filter(beneficiary =>
              beneficiary.name.toLowerCase().includes(params.term.toLowerCase()) ||
              beneficiary.email.toLowerCase().includes(params.term.toLowerCase())
            );
            console.log('Beneficiaries after filter:', filteredBeneficiaries);
            return filteredBeneficiaries;
          }),
          map(beneficiaries => {
            const sortedBeneficiaries = [...beneficiaries].sort((a, b) => {
              const multiplier = params.direction === 'asc' ? 1 : -1;
              if (params.field === 'name') {
                return a.name.localeCompare(b.name) * multiplier;
              } else if (params.field === 'budget') {
                return (Number(a.budget) - Number(b.budget)) * multiplier;
              } else if (params.field === 'power') {
                return (Number(a.power) - Number(b.power)) * multiplier;
              }
              return 0;
            });
            console.log('Beneficiaries after sort:', sortedBeneficiaries);
            return sortedBeneficiaries;
          }),
          catchError(error => {
            console.error('Error fetching beneficiaries:', error);
            // Return mock data if service fails
            return of([
              { id: '1', name: 'John Doe', email: 'john@example.com', budget: 1000, power: 50, isApproved: true, averageRating: 4.5 },
              { id: '2', name: 'Jane Smith', email: 'jane@example.com', budget: 2000, power: 75, isApproved: true, averageRating: 3.8 }
            ] as Beneficiary[]);
          })
        );
      })
    );

    // Subscribe and update component properties
    this.beneficiariesSubscription = beneficiaries$.subscribe({
      next: (data) => {
        console.log('Subscription received data:', data);
        this.beneficiaries = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Subscription error:', error);
        this.loading = false;
        this.beneficiaries = [];
      }
    });

    // Fallback to set loading to false after a timeout in case service hangs
    setTimeout(() => {
      console.log('Timeout triggered - setting loading to false');
      this.loading = false;
    }, 1000);
  }

  onSearchChange(): void {
    this.searchSubject.next({ term: this.searchTerm, field: this.sortField, direction: this.sortDirection });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearchChange();
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      // Toggle direction if clicking the same field
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Default to ascending for a new field
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.onSearchChange();
  }

  trackById(index: number, beneficiary: Beneficiary): string {
    return beneficiary.id;
  }
}
