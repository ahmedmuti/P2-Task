import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { BeneficiaryService } from '../../../core/services/beneficiary.service';
import { Gender } from '../../../core/models/beneficiary.model';

@Component({
  selector: 'app-add-beneficiary',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, RouterLink],
  templateUrl: './add-beneficiary.component.html',
  styleUrls: ['./add-beneficiary.component.scss']
})
export class AddBeneficiaryComponent {
  private fb = inject(FormBuilder);
  private beneficiaryService = inject(BeneficiaryService);
  private router = inject(Router);

  // Expose Gender enum to template
  Gender = Gender;

  beneficiaryForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';

  constructor() {
    this.beneficiaryForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      gender: ['', Validators.required],
      phone: ['', Validators.required],
      budget: ['', [Validators.required, Validators.min(0)]],
      power: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      isApproved: [true]
    });
  }

  get f() { return this.beneficiaryForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Stop if form is invalid
    if (this.beneficiaryForm.invalid) {
      return;
    }

    this.loading = true;

    this.beneficiaryService.addBeneficiary(this.beneficiaryForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/beneficiaries']);
      },
      error: error => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to create beneficiary';
      }
    });
  }
}
