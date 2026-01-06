import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { useRegister } from '../services/auth/register';
import { useLogin } from '../services/auth/login';
import { getErrorMessage } from '../utils/error-handler';
import { AuthService } from '../services/auth/auth.service';

type AuthMode = 'signin' | 'signup';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  authMode = signal<AuthMode>('signin');
  signInForm: FormGroup;
  signUpForm: FormGroup;
  registerMutation = useRegister();
  loginMutation = useLogin();
  getErrorMessage = getErrorMessage;

  departments = [
    { value: 'cs', label: 'Computer Science' },
    { value: 'ee', label: 'Electrical Engineering' },
    { value: 'me', label: 'Mechanical Engineering' },
    { value: 'ce', label: 'Civil Engineering' },
    { value: 'it', label: 'Information Technology' },
    { value: 'ece', label: 'Electronics & Communication' },
  ];

  years = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
  ];

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator]],
    });

    this.signUpForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        department: ['', [Validators.required]],
        year: ['', [Validators.required]],
        studentId: ['', [Validators.required]],
        password: ['', [Validators.required, this.passwordValidator]],
        confirmPassword: ['', [Validators.required, this.confirmPasswordValidator]],
      },
      { validators: this.passwordMatchValidator }
    );

    this.signUpForm.get('password')?.valueChanges.subscribe(() => {
      this.signUpForm.get('confirmPassword')?.updateValueAndValidity();
    });

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.route.queryParams.subscribe((params) => {
      if (params['mode'] === 'signup') {
        this.authMode.set('signup');
      } else {
        this.authMode.set('signin');
      }
    });
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const errors: ValidationErrors = {};

    if (value.length < 6) {
      errors['minlength'] = { requiredLength: 6, actualLength: value.length };
    }

    if (!/[a-z]/.test(value)) {
      errors['noLowerCase'] = true;
    }

    if (!/[A-Z]/.test(value)) {
      errors['noUpperCase'] = true;
    }

    if (!/[0-9]/.test(value)) {
      errors['noNumber'] = true;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      errors['noSpecialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !control.parent) {
      return null;
    }
    const password = control.parent.get('password')?.value;
    return password === control.value ? null : { passwordMismatch: true };
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  setAuthMode(mode: AuthMode) {
    this.authMode.set(mode);
    this.signInForm.reset();
    this.signUpForm.reset();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode },
      queryParamsHandling: 'merge',
    });
  }

  onSignIn() {
    if (this.signInForm.invalid) {
      Object.keys(this.signInForm.controls).forEach((key) => {
        this.signInForm.get(key)?.markAsTouched();
        this.signInForm.get(key)?.markAsDirty();
      });
      return;
    }

    const formValue = this.signInForm.value;
    this.loginMutation.mutate(
      {
        email: formValue.email,
        password: formValue.password,
      },
      {
        onSuccess: async (response) => {
          if (response?.token && response?.userId) {
            this.authService.setAuthData(response.token, response.userId);
            await this.authService.loadUserData();

            this.snackBar.open('Login successful!', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['success-toast'],
            });
            this.router.navigate(['/dashboard']);
          }
        },
        onError: (error) => {
          this.snackBar.open(getErrorMessage(error), 'Close', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-toast'],
          });
        },
      }
    );
  }

  onSignUp() {
    if (this.signUpForm.invalid) {
      Object.keys(this.signUpForm.controls).forEach((key) => {
        this.signUpForm.get(key)?.markAsTouched();
        this.signUpForm.get(key)?.markAsDirty();
      });
      return;
    }

    const formValue = this.signUpForm.value;

    this.registerMutation.mutate(
      {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        studentIdNumber: formValue.studentId,
        department: formValue.department,
        year: formValue.year,
        password: formValue.password,
        role: 'passenger',
      },
      {
        onSuccess: (response) => {
          const message = response?.message || 'Registration successful!';
          this.snackBar.open(message, 'Close', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-toast'],
          });
          this.signUpForm.reset();
        },
        onError: (error) => {
          this.snackBar.open(getErrorMessage(error), 'Close', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-toast'],
          });
        },
      }
    );
  }

  getEmailErrorMessage(form: FormGroup) {
    const emailControl = form.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    if (emailControl?.hasError('email')) {
      return 'Please enter a valid email';
    }
    return '';
  }

  getPasswordErrorMessage(form: FormGroup) {
    const passwordControl = form.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Password is required';
    }
    if (passwordControl?.hasError('minlength')) {
      const error = passwordControl.getError('minlength');
      return `Password must be at least ${error.requiredLength} characters`;
    }
    if (passwordControl?.hasError('noLowerCase')) {
      return 'Password must contain at least one lowercase letter';
    }
    if (passwordControl?.hasError('noUpperCase')) {
      return 'Password must contain at least one uppercase letter';
    }
    if (passwordControl?.hasError('noNumber')) {
      return 'Password must contain at least one number';
    }
    if (passwordControl?.hasError('noSpecialChar')) {
      return 'Password must contain at least one special character';
    }
    return '';
  }
}
