import { Injectable, signal } from '@angular/core';
import { Beneficiary, Gender, Rating } from '../models/beneficiary.model';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class BeneficiaryService {
    // Mock beneficiaries for demo purposes
    private MOCK_BENEFICIARIES: Beneficiary[] = [
        {
            id: '1',
            name: 'John Doe',
            age: 28,
            gender: Gender.MALE,
            email: 'john@example.com',
            phone: '+1234567890',
            budget: 5000,
            power: 85,
            isApproved: true,
            ratings: [
                {
                    id: '101',
                    raterId: '2',
                    raterName: 'Jane Smith',
                    value: 4.5,
                    comment: 'Great to work with!',
                    createdAt: new Date('2023-01-15')
                }
            ],
            averageRating: 4.5,
            createdAt: new Date('2022-12-01'),
            updatedAt: new Date('2023-01-15')
        },
        {
            id: '2',
            name: 'Jane Smith',
            age: 32,
            gender: Gender.FEMALE,
            email: 'jane@example.com',
            phone: '+1987654321',
            budget: 7500,
            power: 92,
            isApproved: true,
            ratings: [
                {
                    id: '102',
                    raterId: '1',
                    raterName: 'John Doe',
                    value: 5,
                    comment: 'Excellent communication and results',
                    createdAt: new Date('2023-02-10')
                }
            ],
            averageRating: 5,
            createdAt: new Date('2022-11-15'),
            updatedAt: new Date('2023-02-10')
        },
        {
            id: '3',
            name: 'Alex Johnson',
            age: 25,
            gender: Gender.OTHER,
            email: 'alex@example.com',
            phone: '+1122334455',
            budget: 3200,
            power: 78,
            isApproved: true,
            ratings: [],
            averageRating: 0,
            createdAt: new Date('2023-03-01'),
            updatedAt: new Date('2023-03-01')
        },
        {
            id: '4',
            name: 'Sarah Williams',
            age: 30,
            gender: Gender.FEMALE,
            email: 'sarah@example.com',
            phone: '+1555666777',
            budget: 6000,
            power: 88,
            isApproved: false,
            ratings: [],
            averageRating: 0,
            createdAt: new Date('2023-04-05'),
            updatedAt: new Date('2023-04-05')
        }
    ];

    // Signal for beneficiaries
    beneficiaries = signal<Beneficiary[]>([...this.MOCK_BENEFICIARIES]);

    constructor(private authService: AuthService) { }

    getAllBeneficiaries(): Observable<Beneficiary[]> {
        return of([...this.MOCK_BENEFICIARIES]).pipe(
            delay(500) // Simulate network delay
        );
    }

    getApprovedBeneficiaries(): Observable<Beneficiary[]> {
        console.log('getApprovedBeneficiaries() called - returning mock data');
        return of(this.MOCK_BENEFICIARIES.filter(b => b.isApproved)).pipe(
            delay(1000) // Simulate network delay
        );
    }

    getBeneficiaryById(id: string): Observable<Beneficiary> {
        const beneficiary = this.MOCK_BENEFICIARIES.find(b => b.id === id);

        if (beneficiary) {
            return of({ ...beneficiary }).pipe(delay(300));
        }

        return throwError(() => new Error('Beneficiary not found'));
    }

    addBeneficiary(beneficiary: Omit<Beneficiary, 'id' | 'ratings' | 'averageRating' | 'createdAt' | 'updatedAt'>): Observable<Beneficiary> {
        // Only admins can approve beneficiaries
        if (!this.authService.isAdmin()) {
            return throwError(() => new Error('Unauthorized: Only admins can add beneficiaries'));
        }

        const newBeneficiary: Beneficiary = {
            ...beneficiary,
            id: (this.MOCK_BENEFICIARIES.length + 1).toString(),
            ratings: [],
            averageRating: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.MOCK_BENEFICIARIES.push(newBeneficiary);
        this.beneficiaries.set([...this.MOCK_BENEFICIARIES]);

        return of(newBeneficiary).pipe(delay(500));
    }

    approveBeneficiary(id: string): Observable<Beneficiary> {
        // Only admins can approve beneficiaries
        if (!this.authService.isAdmin()) {
            return throwError(() => new Error('Unauthorized: Only admins can approve beneficiaries'));
        }

        const index = this.MOCK_BENEFICIARIES.findIndex(b => b.id === id);

        if (index === -1) {
            return throwError(() => new Error('Beneficiary not found'));
        }

        this.MOCK_BENEFICIARIES[index] = {
            ...this.MOCK_BENEFICIARIES[index],
            isApproved: true,
            updatedAt: new Date()
        };

        this.beneficiaries.set([...this.MOCK_BENEFICIARIES]);

        return of(this.MOCK_BENEFICIARIES[index]).pipe(delay(500));
    }

    rateBeneficiary(beneficiaryId: string, rating: number, comment?: string): Observable<Beneficiary> {
        // Check if user is authenticated
        if (!this.authService.isAuthenticated()) {
            return throwError(() => new Error('Unauthorized: Please login to rate beneficiaries'));
        }

        const currentUser = this.authService.currentUser();

        if (!currentUser) {
            return throwError(() => new Error('User not found'));
        }

        // Users cannot rate themselves
        if (currentUser.id === beneficiaryId) {
            return throwError(() => new Error('You cannot rate yourself'));
        }

        const index = this.MOCK_BENEFICIARIES.findIndex(b => b.id === beneficiaryId);

        if (index === -1) {
            return throwError(() => new Error('Beneficiary not found'));
        }

        // Check if user has already rated this beneficiary
        const existingRatingIndex = this.MOCK_BENEFICIARIES[index].ratings.findIndex(
            r => r.raterId === currentUser.id
        );

        const newRating: Rating = {
            id: Date.now().toString(),
            raterId: currentUser.id,
            raterName: currentUser.name,
            value: rating,
            comment,
            createdAt: new Date()
        };

        let updatedRatings: Rating[];

        if (existingRatingIndex >= 0) {
            // Update existing rating
            updatedRatings = [...this.MOCK_BENEFICIARIES[index].ratings];
            updatedRatings[existingRatingIndex] = newRating;
        } else {
            // Add new rating
            updatedRatings = [...this.MOCK_BENEFICIARIES[index].ratings, newRating];
        }

        // Calculate new average rating
        const averageRating = updatedRatings.length > 0
            ? updatedRatings.reduce((sum, r) => sum + r.value, 0) / updatedRatings.length
            : 0;

        // Update beneficiary
        this.MOCK_BENEFICIARIES[index] = {
            ...this.MOCK_BENEFICIARIES[index],
            ratings: updatedRatings,
            averageRating,
            updatedAt: new Date()
        };

        this.beneficiaries.set([...this.MOCK_BENEFICIARIES]);

        return of(this.MOCK_BENEFICIARIES[index]).pipe(delay(500));
    }

    searchBeneficiaries(query: string): Observable<Beneficiary[]> {
        if (!query.trim()) {
            return this.getAllBeneficiaries();
        }

        const lowercaseQuery = query.toLowerCase().trim();

        return of(
            this.MOCK_BENEFICIARIES.filter(b =>
                b.name.toLowerCase().includes(lowercaseQuery) ||
                b.email.toLowerCase().includes(lowercaseQuery)
            )
        ).pipe(delay(300));
    }

    sortBeneficiariesByName(ascending: boolean = true): Observable<Beneficiary[]> {
        return this.getAllBeneficiaries().pipe(
            map(beneficiaries =>
                [...beneficiaries].sort((a, b) => {
                    const comparison = a.name.localeCompare(b.name);
                    return ascending ? comparison : -comparison;
                })
            )
        );
    }

    sortBeneficiariesByBudget(ascending: boolean = true): Observable<Beneficiary[]> {
        return this.getAllBeneficiaries().pipe(
            map(beneficiaries =>
                [...beneficiaries].sort((a, b) => {
                    const comparison = a.budget - b.budget;
                    return ascending ? comparison : -comparison;
                })
            )
        );
    }

    sortBeneficiariesByPower(ascending: boolean = true): Observable<Beneficiary[]> {
        return this.getAllBeneficiaries().pipe(
            map(beneficiaries =>
                [...beneficiaries].sort((a, b) => {
                    const comparison = a.power - b.power;
                    return ascending ? comparison : -comparison;
                })
            )
        );
    }
}
