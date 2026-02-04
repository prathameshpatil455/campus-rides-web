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
import { SidebarComponent } from '../components/sidebar/sidebar';
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
    SidebarComponent,
  ],
  templateUrl: './post-ride.html',
  styleUrl: './post-ride.css',
})
export class PostRide {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  isDriverMode = true;


  postRideForm: FormGroup;



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
    console.log(`PostRide: onLocationChange for ${field}`, location);
    this.postRideForm.patchValue({ [field]: location });
    console.log(`PostRide: Form value for ${field} updated to`, this.postRideForm.get(field)?.value);
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
        onError: (error: any) => {
          console.error('Failed to create ride:', error);
          
          let errorMessage = getErrorMessage(error);
          if (error.error && typeof error.error === 'object') {
             // Try to extract more specific validation errors if available
             if (error.error.message) {
                 errorMessage = error.error.message;
             }
             // Sometimes validation errors come as a list or nested object
             if (error.error.errors) {
                 errorMessage += ` ${JSON.stringify(error.error.errors)}`;
             }
          }

          this.snackBar.open(`Error: ${errorMessage}`, 'Close', {
            duration: 10000, // Longer duration to read
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
