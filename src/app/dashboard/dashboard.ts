import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { useGetRides, Ride as BackendRide } from '../services/rides/get-rides';
import { useGetMyRides } from '../services/rides/get-my-rides';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';
import { SidebarComponent } from '../components/sidebar/sidebar';

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  variant: 'primary' | 'default' | 'warning';
  trend?: string;
}

interface ActiveRide {
  id?: string;
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
  // ... (other properties if any)
}

interface UserStat {
  label: string;
  value: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, SidebarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  isDriverMode = true;
  ridesQuery = useGetRides();
  myRidesQuery = useGetMyRides(() => ({ status: 'active' }));

  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  get currentUser() {
    const user = this.authService.getUserData();
    if (!user) {
      return {
        fullName: 'Guest User',
        initials: 'GU',
        department: '',
        id: '',
      };
    }
    return {
      fullName: `${user.firstName} ${user.lastName}`,
      initials: (user.firstName[0] + user.lastName[0]).toUpperCase(),
      department: user.department,
      id: user._id,
    };
  }


  private getDriverDisplayName(ride: BackendRide): string {
    const r = ride as { driverName?: string; driverId?: { fullName?: string; firstName?: string; lastName?: string } };
    if (r.driverName && r.driverName.trim()) return r.driverName.trim();
    const d = r.driverId;
    if (d && typeof d === 'object') {
      if (d.fullName && String(d.fullName).trim()) return String(d.fullName).trim();
      const first = d.firstName ?? '';
      const last = d.lastName ?? '';
      const name = [first, last].filter(Boolean).join(' ').trim();
      if (name) return name;
    }
    return 'Unknown Driver';
  }

  private formatLocation(loc: unknown): string {
    if (!loc || typeof loc !== 'object') return '—';
    const o = loc as {
      name?: string;
      address?: string;
      coordinates?: { lat?: number; lng?: number; latitude?: number; longitude?: number };
    };
    if (o.name && o.name.trim()) return o.name.trim();
    if (o.address && o.address.trim()) return o.address.trim();
    if (o.coordinates) {
      const lat = o.coordinates.lat ?? o.coordinates.latitude;
      const lng = o.coordinates.lng ?? o.coordinates.longitude;
      if (lat != null && lng != null) return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
    }
    return '—';
  }

  private getRideDepartureTime(ride: BackendRide): Date {
    const raw = ride.time ?? ride.date ?? (ride as { departureTime?: string; departureDate?: string; createdAt?: string }).departureTime
      ?? (ride as { departureTime?: string; departureDate?: string; createdAt?: string }).departureDate
      ?? (ride as { departureTime?: string; departureDate?: string; createdAt?: string }).createdAt;
    const d = new Date(raw ?? 0);
    return isNaN(d.getTime()) ? new Date(0) : d;
  }

  private isFutureRide(ride: BackendRide): boolean {
    return this.getRideDepartureTime(ride).getTime() > Date.now();
  }

  private mapRide(ride: BackendRide) {
    const rideId =
      (ride as { _id?: string; id?: string })._id ?? (ride as { _id?: string; id?: string }).id;

    const departureTime = this.getRideDepartureTime(ride);
    const formattedDate = !isNaN(departureTime.getTime())
      ? departureTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      : '—';

    let formattedTime = ride.time ?? (ride as { departureTime?: string }).departureTime ?? '—';
    if (typeof formattedTime === 'string' && formattedTime.includes('T')) {
      const timeDate = new Date(formattedTime);
      if (!isNaN(timeDate.getTime())) {
        formattedTime = timeDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      }
    }

    const seatsCount = ride.availableSeats ?? ride.totalSeats ?? (ride as { seats?: number }).seats ?? '?';
    const driverName = this.getDriverDisplayName(ride);
    const driverInitials = driverName !== 'Unknown Driver'
      ? driverName.substring(0, 2).toUpperCase()
      : 'UD';

    const pickupLoc = (ride as { pickup?: unknown }).pickup ?? ride.from;
    const destLoc = (ride as { destination?: unknown }).destination ?? ride.to;

    return {
      id: rideId ?? '',
      driverName,
      driverInitials,
      rating: 5.0,
      totalRides: 10,
      pickup: this.formatLocation(pickupLoc),
      destination: this.formatLocation(destLoc),
      date: formattedDate,
      time: formattedTime,
      seats: `${seatsCount} seats`,
      status: (ride.price === 0 ? 'free' : 'paid') as 'free' | 'paid',
    };
  }

  get activeRides(): ActiveRide[] {
    const rides = this.myRidesQuery.data() as BackendRide[] | undefined;
    if (!rides) return [];
    return rides.filter((ride) => this.isFutureRide(ride)).map((ride) => this.mapRide(ride));
  }

  get availableRides(): ActiveRide[] {
    const rides = this.ridesQuery.data() as BackendRide[] | undefined;
    const user = this.currentUser;

    if (!rides) return [];

    return rides
      .filter((ride) => {
        const rideDriverId = typeof ride.driverId === 'object' ? ride.driverId._id : ride.driverId;
        const isNotPoster = !user.id || rideDriverId !== user.id;
        return isNotPoster && this.isFutureRide(ride);
      })
      .map((ride) => this.mapRide(ride));
  }

  get statCards(): StatCard[] {
    const ridesCount = this.activeRides.length;
    return [
      {
        title: 'Active Rides',
        value: ridesCount.toString(),
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
  }

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
}
