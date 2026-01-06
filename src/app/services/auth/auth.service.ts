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
    if (!userId) {
      return;
    }

    try {
      const response = await this.apiService.get<User>(`/user/${userId}`).toPromise();
      if (response?.data) {
        this.setUserData(response.data);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
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
      if (stored) {
        try {
          const user = JSON.parse(stored);
          this.currentUser.set(user);
          return user;
        } catch {
          return null;
        }
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
