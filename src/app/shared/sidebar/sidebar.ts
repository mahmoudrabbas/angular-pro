import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { CurrentUserService } from '../../services/current-user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  constructor(public authService: AuthService) {}
  private router = inject(Router);
  private currentUserService = inject(CurrentUserService);

  isDashboardDropdownOpen = false;

  user = this.currentUserService.user;

  get initials(): string {
    const name = this.user()?.name;
    if (!name) return 'ME';
    return name
      .split(' ')
      .filter((n: string) => n.length > 0)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  logout() {
    // this.currentUserService.clear();
    // this.router.navigate(['/login']);

    this.authService.signout();
    this.isDashboardDropdownOpen = false;
  }
}
