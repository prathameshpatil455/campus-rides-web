import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { useGetRidesPaginated, Ride as BackendRide } from '../services/rides/get-rides';
import { useCreateBooking } from '../services/bookings/create-booking';
import { AuthService } from '../services/auth/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SidebarComponent } from '../components/sidebar/sidebar';

interface DisplayRide {
  id: string;
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

const PAGE_SIZE = 10;

@Component({
  selector: 'app-all-rides',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    SidebarComponent,
  ],
  templateUrl: './all-rides.html',
  styleUrl: './all-rides.css',
})
export class AllRides {
  currentPage = 1;

  ridesQuery = useGetRidesPaginated(() => ({
    status: 'active',
    limit: PAGE_SIZE,
    page: this.currentPage,
  }));
  createBookingMutation = useCreateBooking();

  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);


  get paginated() {
    return this.ridesQuery.data();
  }

  get rides(): DisplayRide[] {
    const data = this.paginated;
    if (!data?.rides) return [];
    const currentUserId = this.authService.getUserId();
    const list = data.rides
      .filter((r) => {
        if (!currentUserId) return true;
        const driverId = typeof r.driverId === 'object' ? r.driverId?._id : r.driverId;
        return driverId !== currentUserId;
      })
      .map((r) => this.mapRide(r));
    return list;
  }

  get total(): number {
    return this.paginated?.total ?? 0;
  }

  get totalPages(): number {
    return this.paginated?.totalPages ?? 1;
  }

  get page(): number {
    return this.paginated?.page ?? 1;
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    if (total <= 0) return [];
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  get isLoading(): boolean {
    return this.ridesQuery.isLoading();
  }


  private getDriverDisplayName(ride: BackendRide): string {
    const r = ride as { driverName?: string; driverId?: { fullName?: string; firstName?: string; lastName?: string } };
    if (r.driverName?.trim()) return r.driverName.trim();
    const d = r.driverId;
    if (d && typeof d === 'object') {
      if (d.fullName?.trim()) return String(d.fullName).trim();
      const first = d.firstName ?? '';
      const last = d.lastName ?? '';
      const name = [first, last].filter(Boolean).join(' ').trim();
      if (name) return name;
    }
    return 'Unknown Driver';
  }

  private formatLocation(loc: unknown): string {
    if (!loc || typeof loc !== 'object') return '—';
    const o = loc as { name?: string; address?: string; coordinates?: { lat?: number; lng?: number; latitude?: number; longitude?: number } };
    if (o.name?.trim()) return o.name.trim();
    if (o.address?.trim()) return o.address.trim();
    if (o.coordinates) {
      const lat = o.coordinates.lat ?? o.coordinates.latitude;
      const lng = o.coordinates.lng ?? o.coordinates.longitude;
      if (lat != null && lng != null) return `${Number(lat).toFixed(2)}, ${Number(lng).toFixed(2)}`;
    }
    return '—';
  }

  private mapRide(ride: BackendRide): DisplayRide {
    const rawDate = ride.date ?? (ride as { createdAt?: string }).createdAt ?? ride.time ?? '';
    const rideDate = new Date(rawDate);
    const formattedDate = !isNaN(rideDate.getTime())
      ? rideDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      : '—';

    let formattedTime = ride.time ?? '—';
    if (typeof formattedTime === 'string' && formattedTime.includes('T')) {
      const timeDate = new Date(formattedTime);
      if (!isNaN(timeDate.getTime())) {
        formattedTime = timeDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      }
    }

    const pickupLoc = (ride as { pickup?: unknown }).pickup ?? ride.from;
    const destLoc = (ride as { destination?: unknown }).destination ?? ride.to;
    const seatsCount = ride.availableSeats ?? ride.totalSeats ?? (ride as { seats?: number }).seats ?? '?';
    const driverName = this.getDriverDisplayName(ride);
    const driverInitials = driverName !== 'Unknown Driver' ? driverName.substring(0, 2).toUpperCase() : 'UD';

    return {
      id: ride._id,
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

  setPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  bookRide(ride: DisplayRide) {
    this.createBookingMutation.mutate(
      { rideId: ride.id },
      {
        onSuccess: () => {
          this.snackBar.open('Ride booked successfully.', 'Close', { duration: 3000 });
        },
        onError: () => {
          this.snackBar.open('Failed to book ride. Please try again.', 'Close', { duration: 3000 });
        },
      }
    );
  }
}
