# Beneficiary HR Application

A professional Angular frontend application for the Beneficiary employment agency to manage HR operations. This application provides authentication, beneficiary management, rating features, and profile views using standalone Angular components with Bootstrap.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.14.

## Features

- **Authentication System**: Login and registration with role-based access (Admin and Beneficiary roles)
- **Beneficiary Management**: List, search, sort, and filter beneficiaries
- **Admin Dashboard**: Approve beneficiaries and add new ones
- **Rating System**: Authenticated beneficiaries can rate other beneficiaries
- **Profile Management**: View and manage user profiles
- **Responsive Design**: Built with Bootstrap for a mobile-friendly experience

## Application Structure

```
src/
├── app/
│   ├── core/                  # Core functionality
│   │   ├── guards/            # Route guards
│   │   ├── models/            # Data models
│   │   └── services/          # Core services
│   ├── features/              # Feature modules
│   │   ├── auth/              # Authentication components
│   │   ├── beneficiaries/     # Beneficiary management
│   │   ├── home/              # Home page
│   │   └── profile/           # User profile
│   └── shared/                # Shared components
│       └── components/        # Reusable UI components
└── assets/                    # Static assets
```

## Demo Accounts

The application includes pre-configured demo accounts for testing:

- **Admin Account**:
  - Email: admin@example.com
  - Password: admin123

- **Beneficiary Account**:
  - Email: user@example.com
  - Password: user123

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   ng serve
   ```
4. Navigate to `http://localhost:4200/`

## Development

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Technologies Used

- Angular 18 (Standalone Components)
- Bootstrap 5
- Angular Signals for state management
- RxJS for reactive programming
- Angular Router for navigation

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
