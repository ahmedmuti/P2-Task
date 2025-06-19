import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user.model';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Mock users for demo purposes
  private readonly MOCK_USERS: User[] = [
    {
      id: '1',
      email: 'admin@beneficiary.com',
      name: 'Admin User',
      role: UserRole.ADMIN
    },
    {
      id: '2',
      email: 'user@beneficiary.com',
      name: 'Regular User',
      role: UserRole.BENEFICIARY
    }
  ];

  // Current user signal
  currentUser = signal<User | null>(null);
  
  // Check if user is authenticated
  isAuthenticated = signal<boolean>(false);

  constructor(private router: Router) {
    // Check if user is already logged in
    this.loadUserFromStorage();
  }

  login(email: string, password: string): Observable<User> {
    // For demo purposes, we're not checking the password
    const user = this.MOCK_USERS.find(u => u.email === email);
    
    if (user) {
      return of(user).pipe(
        delay(800), // Simulate network delay
        tap(user => {
          // Add token for demo purposes
          const userWithToken = { ...user, token: 'mock-jwt-token' };
          this.setCurrentUser(userWithToken);
          return userWithToken;
        })
      );
    }
    
    return throwError(() => new Error('Invalid email or password'));
  }

  register(email: string, name: string, password: string): Observable<User> {
    // Check if user already exists
    if (this.MOCK_USERS.some(u => u.email === email)) {
      return throwError(() => new Error('User already exists'));
    }

    // Create new user (beneficiary role only for registration)
    const newUser: User = {
      id: (this.MOCK_USERS.length + 1).toString(),
      email,
      name,
      role: UserRole.BENEFICIARY
    };

    // Add to mock users (in a real app, this would be a backend call)
    this.MOCK_USERS.push(newUser);

    // Return the new user with a token
    return of({ ...newUser, token: 'mock-jwt-token' }).pipe(
      delay(800), // Simulate network delay
      tap(user => {
        this.setCurrentUser(user);
        return user;
      })
    );
  }

  logout(): void {
    // Clear user data
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem('user');
    
    // Navigate to login page
    this.router.navigate(['/auth/login']);
  }

  private setCurrentUser(user: User): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('user');
      }
    }
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === UserRole.ADMIN;
  }

  isBeneficiary(): boolean {
    return this.currentUser()?.role === UserRole.BENEFICIARY;
  }
}
