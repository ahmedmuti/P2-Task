import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-6">
          <div class="text-center">
            <h1 class="display-1 fw-bold text-primary">404</h1>
            <h2 class="mb-4">Page Not Found</h2>
            <p class="lead mb-5">
              The page you are looking for might have been removed, had its name changed, 
              or is temporarily unavailable.
            </p>
            <a routerLink="/" class="btn btn-primary btn-lg px-4">
              <span class="material-icons me-2">home</span>
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 3rem 0;
    }
  `]
})
export class NotFoundComponent {}
