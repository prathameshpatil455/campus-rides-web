import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { Ride as BackendRide } from '../services/rides/get-rides';
import { useGetMyRides } from '../services/rides/get-my-rides';
import { useDeleteRide } from '../services/rides/delete-ride';
import { useCompleteRide } from '../services/rides/complete-ride';
import { AuthService } from '../services/auth/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { inject } from '@angular/core';
import { SidebarComponent } from '../components/sidebar/sidebar';

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
    MatSnackBarModule,
    SidebarComponent,
  ],
  templateUrl: './my-rides.html',
  styleUrl: './my-rides.css',
})
export class MyRides {
  isDriverMode = true;
  selectedTab: RideStatus = 'active';
  myRidesQuery = useGetMyRides(() => ({ status: this.selectedTab }));
  deleteRideMutation = useDeleteRide();
  completeRideMutation = useCompleteRide();

  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  private formatLocation(loc: unknown): string {
    if (!loc || typeof loc !== 'object') return 'Unknown';
    const o = loc as {
      name?: string;
      address?: string;
      coordinates?: { lat?: number; lng?: number; latitude?: number; longitude?: number };
    };
    if (o.name?.trim()) return o.name.trim();
    if (o.address?.trim()) return o.address.trim();
    if (o.coordinates) {
      const lat = o.coordinates.lat ?? o.coordinates.latitude;
      const lng = o.coordinates.lng ?? o.coordinates.longitude;
      if (lat != null && lng != null) return `${Number(lat).toFixed(2)}, ${Number(lng).toFixed(2)}`;
    }
    return 'Unknown';
  }

  private mapBackendRideToRide(r: BackendRide): Ride {
    const rawDate = r.date ?? (r as { createdAt?: string }).createdAt ?? r.time ?? '';
    const rideDate = new Date(rawDate);
    const formattedDate = !isNaN(rideDate.getTime())
      ? rideDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      : 'Invalid Date';

    let formattedTime = r.time ?? '--:--';
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

    const pickupLoc = (r as { pickup?: unknown }).pickup ?? r.from;
    const destLoc = (r as { destination?: unknown }).destination ?? r.to;
    const seatsCount = r.availableSeats ?? r.totalSeats ?? (r as { seats?: number }).seats ?? 0;
    const status = (
      r.status === 'completed' || r.status === 'cancelled' ? r.status : 'active'
    ) as RideStatus;

    return {
      id: r._id,
      date: formattedDate,
      time: formattedTime,
      pickup: this.formatLocation(pickupLoc),
      destination: this.formatLocation(destLoc),
      availableSeats: `${seatsCount} seats`,
      totalSeats: r.totalSeats ?? r.availableSeats ?? 0,
      isFree: r.price === 0,
      status,
      pendingRequests: 0,
      passengers: [],
    };
  }

  get activeRides(): Ride[] {
    if (this.selectedTab !== 'active') return [];
    const data = this.myRidesQuery.data() as BackendRide[] | undefined;
    if (!data) return [];
    return data.map((r) => this.mapBackendRideToRide(r));
  }

  get ridesByStatus(): Ride[] {
    const data = this.myRidesQuery.data() as BackendRide[] | undefined;
    if (!data) return [];
    return data.map((r) => this.mapBackendRideToRide(r));
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

  completeRide(ride: Ride) {
    this.completeRideMutation.mutate(ride.id, {
      onSuccess: () => {
        this.snackBar.open('Ride marked as completed.', 'Close', { duration: 3000 });
      },
      onError: () => {
        this.snackBar.open('Failed to complete ride. Please try again.', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  deleteRide(ride: Ride) {
    if (!confirm('Are you sure you want to delete this ride?')) return;
    this.deleteRideMutation.mutate(ride.id, {
      onSuccess: () => {
        this.snackBar.open('Ride deleted successfully.', 'Close', { duration: 3000 });
      },
      onError: () => {
        this.snackBar.open('Failed to delete ride. Please try again.', 'Close', { duration: 3000 });
      },
    });
  }
}
