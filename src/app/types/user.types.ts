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
  profileImage?: string;
  isEmailVerified?: boolean;
  isDriverVerified?: boolean;
  isBlocked?: boolean;
  isAdmin?: boolean;
  documents?: {
    studentIDUrl?: string;
    licenseUrl?: string;
  };
  vehicleInfo?: {
    model?: string;
    color?: string;
    plateNumber?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
