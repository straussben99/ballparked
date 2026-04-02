export type Division =
  | 'AL East' | 'AL Central' | 'AL West'
  | 'NL East' | 'NL Central' | 'NL West';

export type League = 'AL' | 'NL';

export interface StadiumCoordinates {
  latitude: number;
  longitude: number;
}

export interface FieldDimensions {
  leftField: number;
  centerField: number;
  rightField: number;
}

export interface Stadium {
  id: string;
  name: string;
  team: string;
  teamAbbr: string;
  city: string;
  state: string;
  address: string;
  coordinates: StadiumCoordinates;
  yearOpened: number;
  capacity: number;
  division: Division;
  league: League;
  fieldDimensions: FieldDimensions;
  notableFeatures: string[];
  funFacts: string[];
  heroImageUrl: string;
  roofType: 'Open' | 'Retractable' | 'Fixed';
  surfaceType: 'Natural Grass' | 'Artificial Turf';
}
