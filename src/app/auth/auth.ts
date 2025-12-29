import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { useRegister } from '../services/auth/register';
import { useLogin } from '../services/auth/login';
import { getErrorMessage } from '../utils/error-handler';

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
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
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
    this.route.queryParams.subscribe((params) => {
      if (params['mode'] === 'signup') {
        this.authMode.set('signup');
      } else {
        this.authMode.set('signin');
      }
    });

    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.signUpForm = this.fb.group(
      {
        fullName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        department: ['', [Validators.required]],
        year: ['', [Validators.required]],
        studentId: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  setAuthMode(mode: AuthMode) {
    this.authMode.set(mode);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode },
      queryParamsHandling: 'merge',
    });
  }

  onSignIn() {
    if (this.signInForm.valid) {
      console.log('Sign In:', this.signInForm.value);
    }
  }

  onSignUp() {
    if (this.signUpForm.valid) {
      console.log('Sign Up:', this.signUpForm.value);
    }
  }

  onTestLogin() {
    const testData = {
      email: 'john.dev@rvce.edu.in',
      password: 'password123',
    };

    this.loginMutation.mutate(testData, {
      onSuccess: (response) => {
        console.log('Login successful:', response);
        if (response?.token) {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboard']);
        }
      },
      onError: (error) => {
        console.error('Login failed:', error);
      },
    });
  }

  onTestRegister() {
    const testData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@rvce.edu.in',
      studentIdNumber: 'RVCE2024001',
      department: 'Computer Science',
      year: '3rd',
      password: 'password123',
      role: 'passenger',
    };

    this.registerMutation.mutate(testData, {
      onSuccess: (response) => {
        console.log('Registration successful:', response);
        if (response?.token) {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboard']);
        }
      },
      onError: (error) => {
        console.error('Registration failed:', error);
      },
    });
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
      return 'Password must be at least 8 characters';
    }
    return '';
  }
}
