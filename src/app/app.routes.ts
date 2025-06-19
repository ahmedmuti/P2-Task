import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

export const routes: Routes = [
  // Public routes
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'beneficiaries', loadComponent: () => import('./features/beneficiaries/beneficiary-list/beneficiary-list.component').then(m => m.BeneficiaryListComponent) },
  { path: 'beneficiaries/:id', loadComponent: () => import('./features/beneficiaries/beneficiary-detail/beneficiary-detail.component').then(m => m.BeneficiaryDetailComponent) },
  
  // Auth routes
  { 
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
    ]
  },
  
  // Protected routes (require authentication)
  { 
    path: 'profile', 
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  
  // Admin routes
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'beneficiaries', loadComponent: () => import('./features/beneficiaries/admin-beneficiary-list/admin-beneficiary-list.component').then(m => m.AdminBeneficiaryListComponent) },
      { path: 'beneficiaries/add', loadComponent: () => import('./features/beneficiaries/add-beneficiary/add-beneficiary.component').then(m => m.AddBeneficiaryComponent) },
    ]
  },
  
  // Fallback route
  { path: '**', component: NotFoundComponent }
];
