import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { useGetRides, Ride as BackendRide } from '../services/rides/get-rides';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';

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
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  isDriverMode = true;
  ridesQuery = useGetRides();

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
        id: ''
      };
    }
    return {
      fullName: `${user.firstName} ${user.lastName}`,
      initials: (user.firstName[0] + user.lastName[0]).toUpperCase(),
      department: user.department,
      id: user._id
    };
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  private mapRide(ride: BackendRide) {
    // Helper to Format Location
    const formatLocation = (loc: any) => {
      if (!loc) return 'Unknown';
      if (loc.address) return loc.address;
      if (loc.coordinates) return `${loc.coordinates.lat.toFixed(4)}, ${loc.coordinates.lng.toFixed(4)}`;
      return 'Pinned Location';
    };

    // Robust Date Formatting
    console.log(`DEBUG: Processing ride ${ride._id}, Full Object:`, JSON.stringify(ride));
    
    // Check for any field that looks like a date
    const rawDate = ride.date || (ride as any).departureDate || (ride as any).dateTime || (ride as any).createdAt;
    const rideDate = new Date(rawDate);
    const formattedDate = !isNaN(rideDate.getTime()) 
      ? rideDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      : 'Invalid Date';

    // Robust Time Formatting
    let formattedTime = ride.time || (ride as any).departureTime || '--:--';
    if (formattedTime.includes('T')) {
      const timeDate = new Date(formattedTime);
      if (!isNaN(timeDate.getTime())) {
        formattedTime = timeDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        });
      }
    }

    // Seat Formatting - User wants "only seats visible"
    const seatsCount = ride.availableSeats ?? ride.totalSeats ?? (ride as any).seats ?? '?';

    return {
      id: ride._id,
      driverName: ride.driverName || 'Unknown Driver',
      driverInitials: ride.driverName ? ride.driverName.substring(0, 2).toUpperCase() : 'UD',
      rating: 5.0, // Mock data
      totalRides: 10, // Mock data
      pickup: formatLocation(ride.from),
      destination: formatLocation(ride.to),
      date: formattedDate,
      time: formattedTime,
      seats: `${seatsCount} seats`,
      status: (ride.price === 0 ? 'free' : 'paid') as 'free' | 'paid'
    };
  }

  get activeRides(): ActiveRide[] {
    const rides = this.ridesQuery.data();
    const user = this.currentUser;
    
    if (!rides) return [];
    if (!user.id) {
       console.warn('Dashboard: Cannot filter Active Rides - No User ID');
       return [];
    }

    return rides
      .filter(ride => {
        // Handle both populated object and string ID
        const rideDriverId = typeof ride.driverId === 'object' ? ride.driverId._id : ride.driverId;
        return rideDriverId === user.id;
      })
      .map(ride => this.mapRide(ride));
  }

  get availableRides(): ActiveRide[] {
    const rides = this.ridesQuery.data();
    const user = this.currentUser;
    
    if (!rides) return [];

    return rides.filter(ride => {
      // Show rides NOT created by current user
      const rideDriverId = typeof ride.driverId === 'object' ? ride.driverId._id : ride.driverId;
      
      // If we don't have a user ID (Guest), show everything
      if (!user.id) return true;
      
      return rideDriverId !== user.id;
    }).map(ride => this.mapRide(ride));
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
