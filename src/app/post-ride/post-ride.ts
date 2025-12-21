import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

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
  ],
  templateUrl: './post-ride.html',
  styleUrl: './post-ride.css',
})
export class PostRide {
  isDriverMode = true;

  currentUser = {
    name: 'Alex Johnson',
    initials: 'AJ',
    department: 'Computer Science',
  };

  postRideForm: FormGroup;

  pickupLocations = [
    { value: 'hostel-a', label: 'Hostel A' },
    { value: 'hostel-b', label: 'Hostel B' },
    { value: 'hostel-c', label: 'Hostel C' },
    { value: 'main-gate', label: 'Main Gate' },
    { value: 'library', label: 'Library' },
    { value: 'canteen', label: 'Canteen' },
  ];

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

  departmentBlocks = [
    { value: 'cs', label: 'Computer Science' },
    { value: 'ee', label: 'Electrical Engineering' },
    { value: 'me', label: 'Mechanical Engineering' },
    { value: 'ce', label: 'Civil Engineering' },
    { value: 'it', label: 'Information Technology' },
    { value: 'ece', label: 'Electronics & Communication' },
  ];

  availableSeats = [
    { value: '1', label: '1 seat' },
    { value: '2', label: '2 seats' },
    { value: '3', label: '3 seats' },
    { value: '4', label: '4 seats' },
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.postRideForm = this.fb.group({
      pickupPoint: ['', [Validators.required]],
      destination: ['', [Validators.required]],
      departmentBlock: [''],
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

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.postRideForm.valid) {
      console.log('Post ride form data:', this.postRideForm.value);
    } else {
      this.postRideForm.markAllAsTouched();
    }
  }
}
