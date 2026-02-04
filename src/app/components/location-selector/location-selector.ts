import { Component, EventEmitter, Input, Output, OnInit, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Location } from '../../types/location';
import { DigipinService } from '../../services/digipin.service';

@Component({
  selector: 'app-location-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './location-selector.html',
  styleUrls: ['./location-selector.css']
})
export class LocationSelector implements OnInit, AfterViewInit {
  @Input() label = 'Location';
  @Output() locationChange = new EventEmitter<Location>();

  @ViewChild('mapCheck') mapContainer!: ElementRef;

  currentLocation: Location | null = null;
  searchQuery = '';
  isLoading = false;

  private map: any; 
  private marker: any;
  private L: any;
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private digipinService: DigipinService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {}

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.L = await import('leaflet');
      // Small delay to ensure container has dimensions
      setTimeout(() => this.initMap(), 100);
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private initMap() {
    if (!this.mapContainer) return;
    
    const L = this.L;
    // Default: Centre of India or a specific Campus location
    const initialState = { lat: 12.9716, lng: 77.5946, zoom: 15 }; 

    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: false // We can add custom zoom controls if needed, or keep default
    }).setView(
      [initialState.lat, initialState.lng],
      initialState.zoom
    );
    
    // Add ResizeObserver to handle container size changes
    this.resizeObserver = new ResizeObserver(() => {
      this.map.invalidateSize();
    });
    this.resizeObserver.observe(this.mapContainer.nativeElement);

    // Add Zoom control to bottom-right (optional, better for mobile)
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      console.log('LocationSelector: Map clicked', e.latlng);
      this.setMapLocation(e.latlng.lat, e.latlng.lng, 'Pinned Location');
    });
    
    this.fixMarkerIcon(L);
  }

  // --- Search Logic ---

  async onSearch() {
    if (!this.searchQuery.trim()) return;
    this.isLoading = true;

    // Check if it looks like a Digipin (e.g. X1-XX-XX-XX-XX or 10 alphanumeric)
    // Simple heuristic: contains hyphens or is 10 chars long
    const isDigipin = /^[A-Z0-9]{2}-?[A-Z0-9]{2}-?[A-Z0-9]{2}-?[A-Z0-9]{2}-?[A-Z0-9]{2}$/i.test(this.searchQuery);

    if (isDigipin) {
      this.digipinService.resolveDigipin(this.searchQuery).subscribe({
        next: (coords) => {
          this.setMapLocation(coords.lat, coords.lng, `Digipin: ${this.searchQuery}`, 'DIGIPIN', this.searchQuery);
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    } else {
      // Nominatim Search
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}`);
        const results = await response.json();
        
        if (results && results.length > 0) {
          const first = results[0];
          this.setMapLocation(parseFloat(first.lat), parseFloat(first.lon), first.display_name);
        }
      } catch (e) {
        console.error('Search failed', e);
      } finally {
        this.isLoading = false;
      }
    }
  }

  useCurrentLocation() {
    if (navigator.geolocation) {
      this.isLoading = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setMapLocation(position.coords.latitude, position.coords.longitude, 'My Current Location');
          this.isLoading = false;
        },
        (error) => {
          console.error("Geolocation denied", error);
          this.isLoading = false;
        }
      );
    }
  }

  // --- Map Helper ---

  private setMapLocation(lat: number, lng: number, address?: string, type: 'GPS' | 'DIGIPIN' = 'GPS', digipin?: string) {
    if (!this.map || !this.L) return;
    const L = this.L;

    // Invalidate size before setting view regarding specific issues
    this.map.invalidateSize();

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }

    this.map.setView([lat, lng], 16);

    console.log('LocationSelector: setMapLocation called', { lat, lng, type, address });
    this.currentLocation = {
      type,
      digipin,
      coordinates: { lat, lng },
      address
    };
    console.log('LocationSelector: Emitting locationChange', this.currentLocation);
    this.locationChange.emit(this.currentLocation);
  }

  private fixMarkerIcon(L: any) {
    const iconRetinaUrl = '/assets/marker-icon-2x.png';
    const iconUrl = '/assets/marker-icon.png';
    const shadowUrl = '/assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }
}
