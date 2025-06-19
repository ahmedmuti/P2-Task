import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, NgClass, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BeneficiaryService } from '../../../core/services/beneficiary.service';
import { Beneficiary } from '../../../core/models/beneficiary.model';
import { Observable, Subject, Subscription, catchError, map, of, startWith, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-admin-beneficiary-list',
  standalone: true,
  imports: [NgClass, RouterLink, FormsModule, DecimalPipe, NgIf, NgFor],
  templateUrl: './admin-beneficiary-list.component.html',
  styleUrl: './admin-beneficiary-list.component.scss'
})
export class AdminBeneficiaryListComponent implements OnInit, OnDestroy {
  private beneficiaryService = inject(BeneficiaryService);

  beneficiaries: Beneficiary[] = [];
  searchSubject = new Subject<{ term: string; field: string; direction: 'asc' | 'desc' }>();
  private beneficiariesSubscription!: Subscription;
  loading = true;
  searchTerm = '';
  sortField = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  approvingId: string | null = null;
  currentPage: number = 1;
  paginationPages: number[] = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    console.log('Admin component initialized - starting data fetch');
    this.initBeneficiariesStream();
  }

  ngOnDestroy(): void {
    if (this.beneficiariesSubscription) {
      this.beneficiariesSubscription.unsubscribe();
    }
  }

  initBeneficiariesStream(): void {
    // Unsubscribe from previous subscription if exists
    if (this.beneficiariesSubscription) {
      this.beneficiariesSubscription.unsubscribe();
    }

    this.loading = true;
    console.log('Admin loading set to true');

    // Create an observable that emits the current search and sort parameters
    const searchParams$ = this.searchSubject.pipe(
      startWith({ term: this.searchTerm, field: this.sortField, direction: this.sortDirection }),
      tap(params => console.log('Admin search params updated:', params))
    );

    // Create observable for beneficiaries data
    const beneficiaries$ = searchParams$.pipe(
      tap(() => console.log('Processing admin search params')),
      switchMap(params => {
        // Get all beneficiaries (both approved and pending)
        console.log('Fetching admin beneficiaries with params:', params);
        return this.beneficiaryService.getAllBeneficiaries().pipe(
          tap(beneficiaries => console.log('Raw admin beneficiaries data received:', beneficiaries)),
          // Apply search filter if needed
          map(beneficiaries => {
            const filteredBeneficiaries = params.term ? 
              beneficiaries.filter(b =>
                b.name.toLowerCase().includes(params.term.toLowerCase()) ||
                b.email.toLowerCase().includes(params.term.toLowerCase())
              ) : beneficiaries;
            console.log('Admin beneficiaries after filter:', filteredBeneficiaries);
            return filteredBeneficiaries;
          }),
          // Apply sorting
          map(beneficiaries => {
            const sortedBeneficiaries = [...beneficiaries].sort((a, b) => {
              const multiplier = params.direction === 'asc' ? 1 : -1;
              if (params.field === 'name') {
                return a.name.localeCompare(b.name) * multiplier;
              } else if (params.field === 'email') {
                return a.email.localeCompare(b.email) * multiplier;
              } else if (params.field === 'budget') {
                return (Number(a.budget) - Number(b.budget)) * multiplier;
              } else if (params.field === 'power') {
                return (Number(a.power) - Number(b.power)) * multiplier;
              }
              return 0;
            });
            console.log('Admin beneficiaries after sort:', sortedBeneficiaries);
            return sortedBeneficiaries;
          }),
          catchError(error => {
            console.error('Error fetching admin beneficiaries:', error);
            // Return empty array if service fails
            return of([]);
          })
        );
      })
    );
    
    // Subscribe and update component properties
    this.beneficiariesSubscription = beneficiaries$.subscribe({
      next: (data) => {
        console.log('Admin subscription received data:', data);
        this.beneficiaries = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Admin subscription error:', error);
        this.loading = false;
        this.beneficiaries = [];
      }
    });
    
    // Fallback to set loading to false after a timeout in case service hangs
    setTimeout(() => {
      console.log('Admin timeout triggered - setting loading to false');
      this.loading = false;
    }, 5000);
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
      // Default to ascending when changing fields
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.onSearchChange();
  }

  approveBeneficiary(id: string): void {
    this.approvingId = id;

    this.beneficiaryService.approveBeneficiary(id).subscribe({
      next: () => {
        this.approvingId = null;
        // Refresh the list
        this.initBeneficiariesStream();
      },
      error: error => {
        console.error('Error approving beneficiary', error);
        this.approvingId = null;
      }
    });
  }

  trackById(index: number, beneficiary: Beneficiary): string {
    return beneficiary.id;
  }

  goToPage(page: number, event: Event): void {
    event.preventDefault();
    this.currentPage = page;
    // You might need to fetch data for the specific page here or adjust the beneficiaries$ observable
    // For now, we'll just update the current page
  }
}
