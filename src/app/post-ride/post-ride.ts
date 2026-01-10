import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LocationSelector } from '../components/location-selector/location-selector';
import { Location } from '../types/location';
import { useCreateRide } from '../services/rides/create-ride';
import { AuthService } from '../services/auth/auth.service';
import { getErrorMessage } from '../utils/error-handler';

@Component({
  selector: 'app-post-ride',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    LocationSelector,
  ],
  templateUrl: './post-ride.html',
  styleUrl: './post-ride.css',
})
export class PostRide {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  isDriverMode = true;

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
    };
  }

  postRideForm: FormGroup;

  destinations = [
    { value: 'cs-block', label: 'Computer Science Block' },
    { value: 'ee-block', label: 'Electrical Engineering Block' },
    { value: 'me-block', label: 'Mechanical Engineering Block' },
    { value: 'ce-block', label: 'Civil Engineering Block' },
    { value: 'it-block', label: 'Information Technology Block' },
    { value: 'ece-block', label: 'Electronics & Communication Block' },
    { value: 'main-gate', label: 'Main Gate' },
    { value: 'library', label: 'Library' },
  ];

  availableSeats = [
    { value: '1', label: '1 seat' },
    { value: '2', label: '2 seats' },
    { value: '3', label: '3 seats' },
    { value: '4', label: '4 seats' },
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.postRideForm = this.fb.group({
      from: [null, [Validators.required]],
      to: [null, [Validators.required]],

      date: ['', [Validators.required]],
      departureTime: ['', [Validators.required]],
      availableSeats: ['', [Validators.required]],
      isFreeRide: [true],
      notes: [''],
    });
  }

  toggleDriverMode() {
    this.isDriverMode = !this.isDriverMode;
  }

  toggleFreeRide() {
    const currentValue = this.postRideForm.get('isFreeRide')?.value;
    this.postRideForm.patchValue({ isFreeRide: !currentValue });
  }

  onCancel() {
    this.router.navigate(['/dashboard']);
  }

  onLocationChange(field: string, location: Location) {
    this.postRideForm.patchValue({ [field]: location });
  }

  createRideMutation = useCreateRide();

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.postRideForm.valid) {
      const formValue = this.postRideForm.value;
      
      const rideData = {
        from: formValue.from,
        to: formValue.to,
        date: formValue.date ? new Date(formValue.date).toISOString() : '', 
        time: formValue.departureTime,
        totalSeats: parseInt(formValue.availableSeats),
        price: formValue.isFreeRide ? 0 : 50 
      };

      console.log('Submitting ride data:', rideData);

      this.createRideMutation.mutate(rideData, {
        onSuccess: () => {
          this.snackBar.open('Ride posted successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.router.navigate(['/my-rides']);
        },
        onError: (error) => {
          console.error('Failed to create ride', error);
          this.snackBar.open(getErrorMessage(error), 'Close', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        }
      });
    } else {
      console.warn('Post Ride Form is invalid:', this.postRideForm.controls);
      this.postRideForm.markAllAsTouched();
    }
  }
}
