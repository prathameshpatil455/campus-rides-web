import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../services/auth/auth.service';

interface VerificationItem {
  id: string;
  title: string;
  description: string;
  status: 'verified' | 'pending' | 'not_uploaded';
  uploadedDate?: string;
  icon: string;
}

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressBarModule,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private authService = inject(AuthService);
  private router = inject(Router);
  isDriverMode = true;

  currentUser = {
    name: 'Alex Johnson',
    initials: 'AJ',
    email: 'alex.johnson@campus.edu',
    department: 'Computer Science',
    rating: 4.8,
    ridesCompleted: 47,
    isDriver: true,
    isVerified: true,
  };

  personalInfo = {
    fullName: 'Alex Johnson',
    email: 'alex.johnson@campus.edu',
    phone: '+1 (555) 123-4567',
  };

  academicInfo = {
    department: 'Computer Science',
    year: '3rd Year',
    studentId: 'CS2022001',
  };

  vehicleInfo = {
    make: 'Toyota',
    model: 'Corolla',
    color: 'Silver',
    plateNumber: 'ABC 1234',
  };

  emergencyContact = {
    phone: '+1 (555) 987-6543',
  };

  verificationItems: VerificationItem[] = [
    {
      id: 'student-id',
      title: 'Student ID Card',
      description: 'Upload a clear photo of your student ID card',
      status: 'verified',
      uploadedDate: 'Dec 1, 2024',
      icon: 'badge',
    },
    {
      id: 'college-email',
      title: 'College Email',
      description: 'Verify your .edu email address',
      status: 'verified',
      uploadedDate: 'Nov 28, 2024',
      icon: 'email',
    },
    {
      id: 'profile-photo',
      title: 'Profile Photo',
      description: 'Upload a clear photo of yourself',
      status: 'pending',
      uploadedDate: 'Dec 2, 2024',
      icon: 'face',
    },
    {
      id: 'drivers-license',
      title: "Driver's License",
      description: 'Required for drivers only',
      status: 'not_uploaded',
      icon: 'warning',
    },
  ];

  notificationPreferences: NotificationPreference[] = [
    {
      id: 'booking-requests',
      label: 'Booking Requests',
      description: 'Get notified when someone books your ride.',
      enabled: true,
    },
    {
      id: 'ride-reminders',
      label: 'Ride Reminders',
      description: 'Receive reminders before your scheduled rides.',
      enabled: true,
    },
    {
      id: 'messages',
      label: 'Messages',
      description: 'Get notified for new chat messages.',
      enabled: true,
    },
    {
      id: 'promotional',
      label: 'Promotional',
      description: 'Receive updates about new features and promotions.',
      enabled: false,
    },
  ];

  get verifiedCount(): number {
    return this.verificationItems.filter((item) => item.status === 'verified').length;
  }

  get totalVerifications(): number {
    return this.verificationItems.length;
  }

  get verificationProgress(): number {
    return (this.verifiedCount / this.totalVerifications) * 100;
  }

  toggleDriverMode() {
    this.isDriverMode = !this.isDriverMode;
  }

  toggleNotification(preference: NotificationPreference) {
    preference.enabled = !preference.enabled;
  }

  uploadDocument(itemId: string) {
    console.log('Upload document:', itemId);
  }

  editProfile() {
    console.log('Edit profile');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
