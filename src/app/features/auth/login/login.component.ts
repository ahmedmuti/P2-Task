import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <h2 class="fw-bold mb-0">Welcome Back</h2>
                <p class="text-muted">Sign in to continue to Beneficiary</p>
              </div>
              
              @if (errorMessage) {
                <div class="alert alert-danger" role="alert">
                  {{ errorMessage }}
                </div>
              }
              
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <span class="material-icons">email</span>
                    </span>
                    <input
                      type="email"
                      id="email"
                      formControlName="email"
                      class="form-control"
                      [ngClass]="{'is-invalid': submitted && f['email'].errors}"
                      placeholder="Enter your email"
                      autocomplete="email"
                    />
                  </div>
                  @if (submitted && f['email'].errors) {
                    <div class="invalid-feedback d-block">
                      @if (f['email'].errors['required']) {
                        Email is required
                      }
                      @if (f['email'].errors['email']) {
                        Please enter a valid email address
                      }
                    </div>
                  }
                </div>
                
                <div class="mb-4">
                  <label for="password" class="form-label">Password</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <span class="material-icons">lock</span>
                    </span>
                    <input
                      [type]="showPassword ? 'text' : 'password'"
                      id="password"
                      formControlName="password"
                      class="form-control"
                      [ngClass]="{'is-invalid': submitted && f['password'].errors}"
                      placeholder="Enter your password"
                      autocomplete="current-password"
                    />
                    <button 
                      type="button" 
                      class="input-group-text bg-transparent" 
                      (click)="togglePasswordVisibility()"
                    >
                      <span class="material-icons">
                        {{ showPassword ? 'visibility_off' : 'visibility' }}
                      </span>
                    </button>
                  </div>
                  @if (submitted && f['password'].errors) {
                    <div class="invalid-feedback d-block">
                      @if (f['password'].errors['required']) {
                        Password is required
                      }
                    </div>
                  }
                </div>
                
                <div class="d-grid gap-2">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg"
                    [disabled]="loading"
                  >
                    @if (loading) {
                      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    } @else {
                      Sign In
                    }
                  </button>
                </div>
                
                <div class="text-center mt-4">
                  <p class="mb-0">
                    Don't have an account? 
                    <a routerLink="/auth/register" class="text-primary fw-bold">Register</a>
                  </p>
                </div>
              </form>
            </div>
          </div>
          
          <div class="card mt-4 shadow">
            <div class="card-body">
              <h5 class="card-title">Demo Accounts</h5>
              <p class="card-text">Use these credentials for testing:</p>
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span>Admin User</span>
                  <button class="btn btn-sm btn-outline-primary" (click)="fillAdminCredentials()">
                    Use Admin
                  </button>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span>Beneficiary User</span>
                  <button class="btn btn-sm btn-outline-primary" (click)="fillBeneficiaryCredentials()">
                    Use Beneficiary
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      border-radius: 10px;
    }
    
    .form-control, .input-group-text {
      padding: 0.75rem 1rem;
      font-size: 1rem;
    }
    
    .form-control:focus {
      box-shadow: none;
    }
    
    .btn-primary {
      padding: 0.75rem 1rem;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  showPassword = false;
  
  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  
  get f() { return this.loginForm.controls; }
  
  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    
    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe({
      next: () => {
        // Get return url from query params or default to home page
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: error => {
        this.errorMessage = error.message || 'Invalid email or password';
        this.loading = false;
      }
    });
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  fillAdminCredentials(): void {
    this.loginForm.patchValue({
      email: 'admin@beneficiary.com',
      password: 'password'
    });
  }
  
  fillBeneficiaryCredentials(): void {
    this.loginForm.patchValue({
      email: 'user@beneficiary.com',
      password: 'password'
    });
  }
}
