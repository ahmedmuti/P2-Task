import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <h2 class="fw-bold mb-0">Create Account</h2>
                <p class="text-muted">Register as a Beneficiary</p>
              </div>
              
              @if (errorMessage) {
                <div class="alert alert-danger" role="alert">
                  {{ errorMessage }}
                </div>
              }
              
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate>
                <div class="mb-3">
                  <label for="name" class="form-label">Full Name</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <span class="material-icons">person</span>
                    </span>
                    <input
                      type="text"
                      id="name"
                      formControlName="name"
                      class="form-control"
                      [ngClass]="{'is-invalid': submitted && f['name'].errors}"
                      placeholder="Enter your full name"
                      autocomplete="name"
                    />
                  </div>
                  @if (submitted && f['name'].errors) {
                    <div class="invalid-feedback d-block">
                      @if (f['name'].errors['required']) {
                        Full name is required
                      }
                    </div>
                  }
                </div>
                
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
                
                <div class="mb-3">
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
                      placeholder="Create a password"
                      autocomplete="new-password"
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
                      @if (f['password'].errors['minlength']) {
                        Password must be at least 6 characters
                      }
                    </div>
                  }
                </div>
                
                <div class="mb-4">
                  <label for="confirmPassword" class="form-label">Confirm Password</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <span class="material-icons">lock</span>
                    </span>
                    <input
                      [type]="showPassword ? 'text' : 'password'"
                      id="confirmPassword"
                      formControlName="confirmPassword"
                      class="form-control"
                      [ngClass]="{'is-invalid': submitted && f['confirmPassword'].errors}"
                      placeholder="Confirm your password"
                      autocomplete="new-password"
                    />
                  </div>
                  @if (submitted && f['confirmPassword'].errors) {
                    <div class="invalid-feedback d-block">
                      @if (f['confirmPassword'].errors['required']) {
                        Please confirm your password
                      }
                      @if (f['confirmPassword'].errors['matching']) {
                        Passwords do not match
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
                      Creating account...
                    } @else {
                      Create Account
                    }
                  </button>
                </div>
                
                <div class="text-center mt-4">
                  <p class="mb-0">
                    Already have an account? 
                    <a routerLink="/auth/login" class="text-primary fw-bold">Sign In</a>
                  </p>
                </div>
              </form>
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  showPassword = false;
  
  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }
  
  get f() { return this.registerForm.controls; }
  
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ matching: true });
    }
    
    return null;
  }
  
  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    
    // Stop if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    const { name, email, password } = this.registerForm.value;
    
    this.authService.register(email, name, password).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: error => {
        this.errorMessage = error.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
