import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { Auth } from './auth/auth';
import { Dashboard } from './dashboard/dashboard';
import { Profile } from './profile/profile';
import { PostRide } from './post-ride/post-ride';
import { MyRides } from './my-rides/my-rides';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'auth', component: Auth },
  { path: 'dashboard', component: Dashboard },
  { path: 'profile', component: Profile },
  { path: 'post-ride', component: PostRide },
  { path: 'my-rides', component: MyRides },
  { path: '**', redirectTo: '' },
];
