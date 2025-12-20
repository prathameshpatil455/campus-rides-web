import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { Auth } from './auth/auth';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'auth', component: Auth },
  { path: 'dashboard', component: Dashboard },
  { path: '**', redirectTo: '' },
];
