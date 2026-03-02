import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-check-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './check-email.html',
  styleUrls: ['./check-email.scss'],
})
export class CheckEmail implements OnInit {
  email = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Optionally pass email via query param for display
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] ?? '';
    });
  }
}
