import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type VerifyState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-email-verified',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './email-verified.html',
  styleUrls: ['./email-verified.scss'],
})
export class EmailVerified implements OnInit {
  state: VerifyState = 'loading';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (!token) {
      this.state = 'error';
      this.errorMessage = 'Verification link is invalid or missing.';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.state = 'success';
        // Auto-redirect to sign-in after 3 seconds
        setTimeout(() => this.router.navigate(['/signin']), 3000);
      },
      error: (err) => {
        this.state = 'error';
        this.errorMessage = err?.error?.message ?? 'This link is invalid or has expired.';
      },
    });
  }
}
