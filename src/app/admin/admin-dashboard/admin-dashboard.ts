import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth/auth.service';
import { useGetCurrentUser } from '../../services/user/get-current-user';
import { useGetAdminStats } from '../../services/admin/get-admin-stats';

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  variant: 'primary' | 'default' | 'warning' | 'success';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  private authService = inject(AuthService);
  private router = inject(Router);

  userQuery = useGetCurrentUser();
  statsQuery = useGetAdminStats();

  get currentUser() {
    const user = this.userQuery.data();
    if (!user) {
      return {
        name: 'Loading...',
        initials: '...',
        email: '',
        department: '',
      };
    }
    return {
      name: `${user.firstName} ${user.lastName}`,
      initials: (user.firstName[0] + user.lastName[0]).toUpperCase(),
      email: user.email,
      department: user.department,
    };
  }

  get statCards(): StatCard[] {
    const stats = this.statsQuery.data();
    
    const totalUsers = stats?.totalUsers ?? 0;
    const totalRides = stats?.totalRides ?? 0;
    const pendingDocuments = stats?.pendingDocuments ?? 0;
    const activeRides = stats?.activeRides ?? 0;

    return [
      {
        title: 'Total Users',
        value: totalUsers.toString(),
        subtitle: 'Registered users',
        icon: 'people',
        variant: 'primary',
      },
      {
        title: 'Total Rides',
        value: totalRides.toString(),
        subtitle: 'All rides',
        icon: 'directions_car',
        variant: 'default',
      },
      {
        title: 'Pending Documents',
        value: pendingDocuments.toString(),
        subtitle: 'Awaiting review',
        icon: 'description',
        variant: 'warning',
      },
      {
        title: 'Active Rides',
        value: activeRides.toString(),
        subtitle: 'Currently active',
        icon: 'check_circle',
        variant: 'success',
      },
    ];
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
