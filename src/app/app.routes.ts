import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { Auth } from './auth/auth';
import { Dashboard } from './dashboard/dashboard';
import { Profile } from './profile/profile';
import { PostRide } from './post-ride/post-ride';
import { MyRides } from './my-rides/my-rides';
import { Messages } from './messages/messages';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { AdminDocuments } from './admin/admin-documents/admin-documents';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: Landing, canActivate: [guestGuard] },
  { path: 'auth', component: Auth, canActivate: [guestGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'post-ride', component: PostRide, canActivate: [authGuard] },
  { path: 'my-rides', component: MyRides, canActivate: [authGuard] },
  { path: 'messages', component: Messages, canActivate: [authGuard] },
  { path: 'admin/dashboard', component: AdminDashboard, canActivate: [adminGuard] },
  { path: 'admin/documents', component: AdminDocuments, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' },
];
