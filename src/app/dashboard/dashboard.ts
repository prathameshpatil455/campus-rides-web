import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth/auth.service';
import { getInitials, getFullName, getFirstName } from '../utils/name.utils';

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  variant: 'primary' | 'default' | 'warning';
  trend?: string;
}

interface ActiveRide {
  driverName: string;
  driverInitials: string;
  rating: number;
  totalRides: number;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  seats: string;
  status: 'free' | 'paid';
}

interface BookingRequest {
  userName: string;
  userInitials: string;
  seats: number;
  status: 'pending' | 'accepted' | 'declined';
  route: string;
}

interface UserStat {
  label: string;
  value: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private authService = inject(AuthService);
  private router = inject(Router);
  isDriverMode = true;

  constructor() {
    const token = this.authService.getToken();
    const userId = this.authService.getUserId();
    const userData = this.authService.getUserData();
    console.log('Dashboard - Token:', token);
    console.log('Dashboard - UserID:', userId);
    console.log('Dashboard - UserData:', userData);
  }

  get currentUser() {
    const user = this.authService.getUserData();
    return {
      name: getFullName(user?.firstName, user?.lastName),
      initials: getInitials(user?.firstName, user?.lastName),
      department: user?.department || 'N/A',
    };
  }

  getFirstName(): string {
    const user = this.authService.getUserData();
    return getFirstName(user?.firstName);
  }

  statCards: StatCard[] = [
    {
      title: 'Active Rides',
      value: '1',
      subtitle: 'Currently scheduled',
      icon: 'directions_car',
      variant: 'primary',
    },
    {
      title: 'Total Rides',
      value: '47',
      subtitle: 'Rides offered',
      icon: 'show_chart',
      variant: 'default',
      trend: '↑12% vs last week',
    },
    {
      title: 'Rating',
      value: '4.8',
      subtitle: 'Out of 5.0',
      icon: 'people',
      variant: 'default',
    },
    {
      title: 'Pending Requests',
      value: '1',
      subtitle: 'Awaiting response',
      icon: 'schedule',
      variant: 'warning',
    },
  ];

  activeRides: ActiveRide[] = [
    {
      driverName: 'Alex Johnson',
      driverInitials: 'AJ',
      rating: 4.8,
      totalRides: 47,
      pickup: 'Hostel A',
      destination: 'Computer Science Block',
      date: 'Mon, Dec 2',
      time: '09:00',
      seats: '1/4 seats',
      status: 'free',
    },
  ];

  bookingRequests: BookingRequest[] = [
    {
      userName: 'Emily Davis',
      userInitials: 'ED',
      seats: 1,
      status: 'pending',
      route: 'Hostel A → Computer Science Block',
    },
  ];

  userStats: UserStat[] = [
    { label: 'Department', value: 'Computer Science' },
    { label: 'Year', value: '3rd Year' },
    { label: 'Member since', value: 'Aug 2023' },
  ];

  toggleDriverMode() {
    this.isDriverMode = !this.isDriverMode;
  }

  acceptRequest(request: BookingRequest) {
    console.log('Accept request:', request);
  }

  declineRequest(request: BookingRequest) {
    console.log('Decline request:', request);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
