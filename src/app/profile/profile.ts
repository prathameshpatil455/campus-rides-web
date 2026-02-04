import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { injectQueryClient } from '@tanstack/angular-query-experimental';
import { AuthService } from '../services/auth/auth.service';
import { useGetCurrentUser } from '../services/user/get-current-user';
import { useUploadDocument } from '../services/user/upload-document';
import { useUpdateUser } from '../services/user/update-user';
import { ApiService } from '../services/api';
import { useGetDocument } from '../services/user/get-document';
import { SidebarComponent } from '../components/sidebar/sidebar';

interface VerificationItem {
  id: string;
  title: string;
  description: string;
  status: 'verified' | 'pending' | 'not_uploaded' | 'rejected';
  uploadedDate?: string;
  documentUrl?: string;
  documentType: 'college-email' | 'student-id' | 'profile-photo' | 'drivers-license';
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
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule,
    SidebarComponent,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private apiService = inject(ApiService);
  private queryClient = injectQueryClient();

  userQuery = useGetCurrentUser();
  uploadDocumentMutation = useUploadDocument();
  updateUserMutation = useUpdateUser();
  profilePhotoQuery = useGetDocument('profilePhoto');

  isEditMode = signal(false);
  uploadingDocumentId = signal<string | null>(null);

  formData = {
    firstName: '',
    lastName: '',
    department: '',
    year: '',
    vehicleModel: '',
    vehicleColor: '',
    vehiclePlateNumber: '',
  };

  get currentUser() {
    const user = this.userQuery.data();
    if (!user) {
      return {
        name: 'Loading...',
        initials: '...',
        email: '',
        department: '',
        rating: 0,
        ridesCompleted: 0,
        isDriver: false,
        isVerified: false,
        isAdmin: false,
        profilePhotoUrl: undefined,
      };
    }
    
    const profilePhotoData = this.profilePhotoQuery.data();
    const profilePhotoUrl = profilePhotoData?.url || undefined;
    
    return {
      name: `${user.firstName} ${user.lastName}`,
      initials: (user.firstName[0] + user.lastName[0]).toUpperCase(),
      email: user.email,
      department: user.department,
      rating: 0,
      ridesCompleted: 0,
      isDriver: !!user.isDriverVerified,
      isVerified: !!user.isEmailVerified,
      isAdmin: !!user.isAdmin,
      profilePhotoUrl,
    };
  }

  get personalInfo() {
    const user = this.userQuery.data();
    if (!user) {
      return {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      };
    }
    
    if (!this.isEditMode() && user) {
      this.formData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        department: user.department || '',
        year: user.year || '',
        vehicleModel: user.vehicleInfo?.model || '',
        vehicleColor: user.vehicleInfo?.color || '',
        vehiclePlateNumber: user.vehicleInfo?.plateNumber || '',
      };
    }
    
    return {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      phone: user.phone || '',
    };
  }

  get academicInfo() {
    const user = this.userQuery.data();
    if (!user) {
      return {
        department: '',
        year: '',
        studentId: '',
      };
    }
    return {
      department: user.department || '',
      year: user.year || '',
      studentId: user.studentIdNumber || '',
    };
  }

  get vehicleInfo() {
    const user = this.userQuery.data();
    if (!user || !user.vehicleInfo) {
      return {
        make: '',
        model: '',
        color: '',
        plateNumber: '',
      };
    }
    return {
      make: '',
      model: user.vehicleInfo.model || '',
      color: user.vehicleInfo.color || '',
      plateNumber: user.vehicleInfo.plateNumber || '',
    };
  }

  get emergencyContact() {
    return {
      phone: '',
    };
  }

  get verificationItems(): VerificationItem[] {
    const user = this.userQuery.data();
    if (!user) {
      return [];
    }

    const documents = user.documents || {};
    const profilePhotoData = this.profilePhotoQuery.data();
    const formatDate = (dateString?: string) => {
      if (!dateString) return undefined;
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    const items: VerificationItem[] = [
      {
        id: 'college-email',
        title: 'College Email',
        description: 'Verify your .edu email address',
        status: user.isEmailVerified ? 'verified' : 'not_uploaded',
        uploadedDate: undefined,
        documentType: 'college-email',
        icon: 'email',
      },
      {
        id: 'student-id',
        title: 'Student ID Card',
        description: 'Upload a clear photo of your student ID card',
        status: (documents.studentIDStatus as any) || 'not_uploaded',
        uploadedDate: formatDate(documents.studentIDUploadedAt),
        documentUrl: documents.studentIDUrl,
        documentType: 'student-id',
        icon: 'badge',
      },
      {
        id: 'profile-photo',
        title: 'Profile Photo',
        description: 'Upload a clear photo of yourself',
        status: (documents.profilePhotoStatus as any) || (profilePhotoData?.url ? 'pending' : 'not_uploaded'),
        uploadedDate: formatDate(documents.profilePhotoUploadedAt),
        documentUrl: profilePhotoData?.url || documents.profilePhotoUrl,
        documentType: 'profile-photo',
        icon: 'face',
      },
      {
        id: 'drivers-license',
        title: "Driver's License",
        description: 'Required for drivers only',
        status: (documents.licenseStatus as any) || 'not_uploaded',
        uploadedDate: formatDate(documents.licenseUploadedAt),
        documentUrl: documents.licenseUrl,
        documentType: 'drivers-license',
        icon: 'warning',
      },
    ];

    return items;
  }

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

  toggleNotification(preference: NotificationPreference) {
    preference.enabled = !preference.enabled;
  }

  uploadDocument(itemId: string) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      let documentType: 'studentID' | 'license' | 'profilePhoto';
      if (itemId === 'student-id') {
        documentType = 'studentID';
      } else if (itemId === 'drivers-license') {
        documentType = 'license';
      } else if (itemId === 'profile-photo') {
        documentType = 'profilePhoto';
      } else {
        this.snackBar.open('Invalid document type', 'Close', { duration: 3000 });
        return;
      }

      this.uploadingDocumentId.set(itemId);
      this.uploadDocumentMutation.mutate(
        { documentType, file },
        {
          onSuccess: () => {
            this.uploadingDocumentId.set(null);
            this.queryClient.invalidateQueries({ queryKey: ['document', documentType] });
            if (documentType === 'profilePhoto') {
              this.profilePhotoQuery.refetch();
            }
            this.snackBar.open('Document uploaded successfully', 'Close', { duration: 3000 });
          },
          onError: (error) => {
            this.uploadingDocumentId.set(null);
            this.snackBar.open('Failed to upload document', 'Close', { duration: 3000 });
            console.error('Upload error:', error);
          },
        }
      );
    };

    input.click();
  }

  previewDocument(item: VerificationItem) {
    if (item.documentType === 'college-email') {
      return;
    }

    let documentType: 'studentID' | 'license' | 'profilePhoto' | null = null;
    if (item.documentType === 'student-id') {
      documentType = 'studentID';
    } else if (item.documentType === 'drivers-license') {
      documentType = 'license';
    } else if (item.documentType === 'profile-photo') {
      documentType = 'profilePhoto';
    }

    if (!documentType) {
      this.snackBar.open('Invalid document type', 'Close', { duration: 3000 });
      return;
    }

    this.apiService
      .get<any>('/user/documents', { documentType })
      .subscribe({
        next: (response) => {
          console.log(response, 'response');
          const documentData = response?.data;
          const documentUrl = documentData?.url;
          if (documentUrl) {
            window.open(documentUrl, '_blank');
          } else {
            this.snackBar.open('Document not found', 'Close', { duration: 3000 });
          }
        },
        error: (error) => {
          this.snackBar.open('Failed to load document', 'Close', { duration: 3000 });
          console.error('Document fetch error:', error);
        },
      });
  }

  editProfile() {
    const user = this.userQuery.data();
    if (!user) return;

    this.formData = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      department: user.department || '',
      year: user.year || '',
      vehicleModel: user.vehicleInfo?.model || '',
      vehicleColor: user.vehicleInfo?.color || '',
      vehiclePlateNumber: user.vehicleInfo?.plateNumber || '',
    };

    this.isEditMode.set(true);
  }

  cancelEdit() {
    this.isEditMode.set(false);
  }

  saveProfile() {
    const updateData = {
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      department: this.formData.department,
      year: this.formData.year,
      vehicleInfo: {
        model: this.formData.vehicleModel || undefined,
        color: this.formData.vehicleColor || undefined,
        plateNumber: this.formData.vehiclePlateNumber || undefined,
      },
    };

    this.updateUserMutation.mutate(updateData, {
      onSuccess: () => {
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        this.isEditMode.set(false);
      },
      onError: (error) => {
        this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 });
        console.error('Update error:', error);
      },
    });
  }

}
