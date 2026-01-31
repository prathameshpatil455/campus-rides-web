import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../../types/user.types';
import { ApiService } from '../api';

const TOKEN_KEY = 'token';
const USER_ID_KEY = 'userId';
const USER_DATA_KEY = 'userData';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private apiService = inject(ApiService);
  currentUser = signal<User | null>(null);

  async loadUserData(): Promise<void> {
    const userId = this.getUserId();
    console.log('AuthService: loadUserData called. UserId:', userId);
    
    if (!userId) {
      console.warn('AuthService: No userId found in storage');
      return;
    }

    try {
      console.log(`AuthService: Fetching user data from /user/${userId}`);
      const response = await this.apiService.get<User>(`/user/${userId}`).toPromise();
      console.log('AuthService: User data response:', response);
      
      if (response?.data) {
        this.setUserData(response.data);
        console.log('AuthService: User data set successfully');
      } else {
        console.error('AuthService: Response missing data property', response);
      }
    } catch (error) {
      console.error('AuthService: Failed to load user data:', error);
    }
  }

  private getStorage(): Storage | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage;
    }
    return null;
  }

  getToken(): string | null {
    const storage = this.getStorage();
    return storage ? storage.getItem(TOKEN_KEY) : null;
  }

  getUserId(): string | null {
    const storage = this.getStorage();
    return storage ? storage.getItem(USER_ID_KEY) : null;
  }

  setToken(token: string): void {
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(TOKEN_KEY, token);
    }
  }

  setUserId(userId: string): void {
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(USER_ID_KEY, userId);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUserId();
  }

  setAuthData(token: string, userId: string): void {
    this.setToken(token);
    this.setUserId(userId);
  }

  setUserData(user: User): void {
    this.currentUser.set(user);
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(USER_DATA_KEY, JSON.stringify(user));
    }
  }

  getUserData(): User | null {
    const cached = this.currentUser();
    if (cached) {
      return cached;
    }

    const storage = this.getStorage();
    if (storage) {
      const stored = storage.getItem(USER_DATA_KEY);
      const storedId = storage.getItem(USER_ID_KEY);
      
      console.log('AuthService: getUserData checking storage.');
      console.log('AuthService: storedData exists?', !!stored);
      console.log('AuthService: storedId:', storedId);

      if (stored) {
        try {
          const user = JSON.parse(stored);
          this.currentUser.set(user);
          return user;
        } catch (e) {
          console.error('AuthService: Error parsing stored userData', e);
          return null;
        }
      }
      
      // Fallback: If we have an ID but no object, return a partial user object
      // so the app can at least function while the profile is loading.
      if (storedId) {
        console.warn('AuthService: Found userId but no userData. Returning partial user.');
        return { _id: storedId, firstName: 'User', lastName: '', email: '', department: '', year: '', studentIdNumber: '' } as User;
      }
    }
    return null;
  }

  clearUserData(): void {
    this.currentUser.set(null);
    const storage = this.getStorage();
    if (storage) {
      storage.removeItem(USER_DATA_KEY);
    }
  }

  logout(): void {
    this.clearUserData();
    const storage = this.getStorage();
    if (storage) {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(USER_ID_KEY);
    }
  }
}
