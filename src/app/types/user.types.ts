export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  year: string;
  studentIdNumber: string;
  phone?: string;
  role?: string;
  roles?: string[];
  isEmailVerified?: boolean;
  isDriverVerified?: boolean;
  isBlocked?: boolean;
  isAdmin?: boolean;
  documents?: {
    studentIDUrl?: string;
    studentIDStatus?: 'not_uploaded' | 'pending' | 'verified' | 'rejected';
    licenseUrl?: string;
    licenseStatus?: 'not_uploaded' | 'pending' | 'verified' | 'rejected';
    profilePhotoUrl?: string;
    profilePhotoStatus?: 'not_uploaded' | 'pending' | 'verified' | 'rejected';
    studentIDUploadedAt?: string;
    licenseUploadedAt?: string;
    profilePhotoUploadedAt?: string;
  };
  vehicleInfo?: {
    model?: string;
    color?: string;
    plateNumber?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
