export type LocationType = 'GPS' | 'DIGIPIN';

export interface Location {
  type: LocationType;
  digipin?: string;         // Required if type is DIGIPIN
  coordinates: {            // Required for both
    lat: number;
    lng: number;
  };
  address?: string;         // Optional descriptive text
}
