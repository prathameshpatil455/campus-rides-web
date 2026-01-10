import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DigipinService {
  /**
   * Mock resolution of Digipin to Coordinates
   * In a real app, this would call an API like India Post's or a third-party service.
   */
  resolveDigipin(digipin: string): Observable<{ lat: number; lng: number }> {
    // Mock logic: return a fixed location near a "Campus Center"
    // For demo purposes, we can vary it slightly based on the string hash
    const hash = digipin.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const mockLat = 12.9716 + (hash % 100) / 10000;
    const mockLng = 77.5946 + (hash % 100) / 10000;

    return of({ lat: mockLat, lng: mockLng }).pipe(delay(500));
  }

  /**
   * Mock generation of Digipin from Coordinates
   */
  getDigipinFromCoordinates(lat: number, lng: number): Observable<string> {
    return of('X1-88-77-AB').pipe(delay(500));
  }
}
