import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

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

  currentUser = {
    name: 'Alex Johnson',
    initials: 'AJ',
    department: 'Computer Science',
  };

  activeRides: Ride[] = [
    {
      id: '1',
      date: 'Mon, Dec 2',
      time: '09:00',
      pickup: 'Hostel A',
      destination: 'Computer Science Block',
      availableSeats: '1/4',
      totalSeats: 4,
      isFree: true,
      status: 'active',
      pendingRequests: 1,
      passengers: [
        { name: 'Sarah Chen', initials: 'SC' },
        { name: 'Emily Davis', initials: 'ED' },
      ],
    },
  ];

  completedRides: Ride[] = [];
  cancelledRides: Ride[] = [];

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

