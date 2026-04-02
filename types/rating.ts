export type RatingCategoryKey = 'vibes' | 'foodAndBeer' | 'views' | 'stadiumIdentity' | 'accessibility';

export type VibeTag = 'Die-hard Fans' | 'Family-Friendly' | 'Corporate' | 'Party Scene' | 'Traditions';
export type FoodBeerTag = 'Signature Dish' | 'Craft Beer' | 'Value' | 'Unique Finds' | 'Standard Concessions';
export type ViewsTag = 'Skyline Backdrop' | 'No Obstructed Views' | 'Close to Action' | 'Upper-Deck Vibe';
export type StadiumIdentityTag = 'Historic' | 'Modern' | 'Quirky Features' | 'Iconic Landmarks';
export type AccessibilityTag = 'Easy Parking' | 'Walkable Concourse' | 'Public Transit' | 'Entrance Flow';

export type RatingTag = VibeTag | FoodBeerTag | ViewsTag | StadiumIdentityTag | AccessibilityTag;

export interface RatingCategoryDefinition {
  key: RatingCategoryKey;
  label: string;
  subtitle: string;
  emoji: string;
  description: string;
  inputType: 'slider' | 'score';
  sliderLabels?: { left: string; right: string };
  tags: string[];
}

export const RATING_CATEGORIES: RatingCategoryDefinition[] = [
  {
    key: 'vibes',
    label: 'Vibes',
    subtitle: 'The Energy',
    emoji: '🔥',
    description: 'How was the crowd and overall atmosphere?',
    inputType: 'slider',
    sliderLabels: { left: 'Quiet / Chill', right: 'Electric / Hostile' },
    tags: ['Die-hard Fans', 'Family-Friendly', 'Corporate', 'Party Scene', 'Traditions'],
  },
  {
    key: 'foodAndBeer',
    label: 'Food & Beer',
    subtitle: 'The Menu',
    emoji: '🍔',
    description: 'How was the food, drinks, and concession experience?',
    inputType: 'score',
    tags: ['Signature Dish', 'Craft Beer', 'Value', 'Unique Finds', 'Standard Concessions'],
  },
  {
    key: 'views',
    label: 'Views',
    subtitle: 'The Sightlines',
    emoji: '👀',
    description: 'How were the views of the field and surroundings?',
    inputType: 'score',
    tags: ['Skyline Backdrop', 'No Obstructed Views', 'Close to Action', 'Upper-Deck Vibe'],
  },
  {
    key: 'stadiumIdentity',
    label: 'Stadium Identity',
    subtitle: 'The Hook',
    emoji: '🏟️',
    description: 'How unique and memorable is this ballpark?',
    inputType: 'slider',
    sliderLabels: { left: 'Cookie-Cutter', right: 'One-of-a-Kind' },
    tags: ['Historic', 'Modern', 'Quirky Features', 'Iconic Landmarks'],
  },
  {
    key: 'accessibility',
    label: 'Accessibility',
    subtitle: 'The Logistics',
    emoji: '🚗',
    description: 'How easy was it to get there and get around?',
    inputType: 'score',
    tags: ['Easy Parking', 'Walkable Concourse', 'Public Transit', 'Entrance Flow'],
  },
];

export interface CategoryRating {
  score: number;
  selectedTags: string[];
}

export interface UserRating {
  id: string;
  stadiumId: string;
  userId: string;
  vibes: CategoryRating;
  foodAndBeer: CategoryRating;
  views: CategoryRating;
  stadiumIdentity: CategoryRating;
  accessibility: CategoryRating;
  overall: number;
  comment?: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}
