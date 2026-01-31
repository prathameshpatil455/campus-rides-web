import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { useGetRides, Ride as BackendRide } from '../services/rides/get-rides';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';

type RideStatus = 'active' | 'completed' | 'cancelled';

interface Passenger {
  name: string;
  initials: string;
}

interface Ride {
  id: string;
  date: string;
  time: string;
  pickup: string;
  destination: string;
  availableSeats: string;
  totalSeats: number;
  isFree: boolean;
  status: RideStatus;
  pendingRequests: number;
  passengers: Passenger[];
}

@Component({
  selector: 'app-my-rides',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatChipsModule,
    MatMenuModule,
  ],
  templateUrl: './my-rides.html',
  styleUrl: './my-rides.css',
})
export class MyRides {
  isDriverMode = true;
  selectedTab: RideStatus = 'active';
  ridesQuery = useGetRides();

  private authService = inject(AuthService);
  private router = inject(Router);

  get currentUser() {
    const user = this.authService.getUserData();
    if (!user) {
      return {
        name: 'Guest User',
        initials: 'GU',
        department: '',
      };
    }
    return {
      name: `${user.firstName} ${user.lastName}`,
      initials: (user.firstName[0] + user.lastName[0]).toUpperCase(),
      department: user.department,
      id: user._id
    };
  }

  // Hardcoded for completed/cancelled for now, as API only returns "active" by default mock
  completedRides: Ride[] = [];
  cancelledRides: Ride[] = [];

  get activeRides(): Ride[] {
    const data = this.ridesQuery.data();
    const user = this.currentUser;
    if (!data || !user.id) return [];
    
    // Map backend Ride to frontend Ride interface AND filter by driverId
    return data
      .filter((r: BackendRide) => {
        const driverId = typeof r.driverId === 'object' ? r.driverId._id : r.driverId;
        return driverId === user.id;
      })
      .map((r: BackendRide) => {
        // Robust Date Formatting
        const rideDate = new Date(r.date);
        const formattedDate = !isNaN(rideDate.getTime()) 
          ? rideDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          : 'Invalid Date';

        // Robust Time Formatting
        let formattedTime = r.time || '--:--';
        if (formattedTime.includes('T')) {
          const timeDate = new Date(formattedTime);
          if (!isNaN(timeDate.getTime())) {
            formattedTime = timeDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          }
        }

        return {
          id: r._id,
          date: formattedDate,
          time: formattedTime,
          pickup: r.from?.address || (r.from?.coordinates ? `${r.from.coordinates.lat.toFixed(2)}, ${r.from.coordinates.lng.toFixed(2)}` : 'Unknown'),
          destination: r.to?.address || (r.to?.coordinates ? `${r.to.coordinates.lat.toFixed(2)}, ${r.to.coordinates.lng.toFixed(2)}` : 'Unknown'),
          availableSeats: `${r.availableSeats ?? r.totalSeats ?? (r as any).seats ?? '?'} seats`,
          totalSeats: r.totalSeats,
          isFree: r.price === 0,
          status: 'active' as RideStatus,
          pendingRequests: 0,
          passengers: []
        };
      });
  }

  get ridesByStatus(): Ride[] {
    switch (this.selectedTab) {
      case 'active':
        return this.activeRides;
      case 'completed':
        return this.completedRides;
      case 'cancelled':
        return this.cancelledRides;
      default:
        return [];
    }
  }

  get activeRidesCount(): number {
    return this.activeRides.length;
  }

  toggleDriverMode() {
    this.isDriverMode = !this.isDriverMode;
  }

  onTabChange(tabIndex: number) {
    const tabs: RideStatus[] = ['active', 'completed', 'cancelled'];
    this.selectedTab = tabs[tabIndex];
  }

  editRide(ride: Ride) {
    console.log('Edit ride:', ride);
  }

  cancelRide(ride: Ride) {
    console.log('Cancel ride:', ride);
  }

  viewDetails(ride: Ride) {
    console.log('View details:', ride);
  }
}

