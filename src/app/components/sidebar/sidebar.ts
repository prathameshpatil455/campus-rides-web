import { Component, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  @Input() mode: 'student' | 'admin' = 'student';

  isCollapsed = signal(false);

  toggleCollapse() {
    this.isCollapsed.set(!this.isCollapsed());
    // Update global CSS variable for main content layout
    document.documentElement.style.setProperty(
      '--sidebar-width',
      this.isCollapsed() ? '80px' : '260px'
    );
  }

  get currentUser() {
    const user = this.authService.getUserData();
    if (!user) {
      return {
        fullName: 'Guest User',
        initials: 'GU',
        department: '',
      };
    }
    return {
      fullName: `${user.firstName} ${user.lastName}`,
      initials: (user.firstName[0] + user.lastName[0]).toUpperCase(),
      department: user.department,
    };
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
