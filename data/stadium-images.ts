import { ImageSourcePropType } from 'react-native';

// Bundled stadium photos — these are included in the app binary
// and load instantly without network requests
export const STADIUM_IMAGES: Record<string, ImageSourcePropType> = {
  'fenway-park': require('@/assets/stadiums/fenway-park.jpg'),
  'yankee-stadium': require('@/assets/stadiums/yankee-stadium.jpg'),
  'oriole-park-at-camden-yards': require('@/assets/stadiums/oriole-park.jpg'),
  'tropicana-field': require('@/assets/stadiums/tropicana-field.jpg'),
  'rogers-centre': require('@/assets/stadiums/rogers-centre.jpg'),
  'guaranteed-rate-field': require('@/assets/stadiums/guaranteed-rate-field.jpg'),
  'progressive-field': require('@/assets/stadiums/progressive-field.jpg'),
  'comerica-park': require('@/assets/stadiums/comerica-park.jpg'),
  'kauffman-stadium': require('@/assets/stadiums/kauffman-stadium.jpg'),
  'target-field': require('@/assets/stadiums/target-field.jpg'),
  'minute-maid-park': require('@/assets/stadiums/minute-maid-park.jpg'),
  'angel-stadium': require('@/assets/stadiums/angel-stadium.jpg'),
  'oakland-coliseum': require('@/assets/stadiums/oakland-coliseum.jpg'),
  't-mobile-park': require('@/assets/stadiums/t-mobile-park.jpg'),
  'globe-life-field': require('@/assets/stadiums/globe-life-field.jpg'),
  'truist-park': require('@/assets/stadiums/truist-park.jpg'),
  'loandepot-park': require('@/assets/stadiums/loandepot-park.jpg'),
  'citi-field': require('@/assets/stadiums/citi-field.jpg'),
  'citizens-bank-park': require('@/assets/stadiums/citizens-bank-park.jpg'),
  'nationals-park': require('@/assets/stadiums/nationals-park.jpg'),
  'wrigley-field': require('@/assets/stadiums/wrigley-field.jpg'),
  'great-american-ball-park': require('@/assets/stadiums/great-american-ball-park.jpg'),
  'american-family-field': require('@/assets/stadiums/american-family-field.jpg'),
  'pnc-park': require('@/assets/stadiums/pnc-park.jpg'),
  'busch-stadium': require('@/assets/stadiums/busch-stadium.jpg'),
  'chase-field': require('@/assets/stadiums/chase-field.jpg'),
  'coors-field': require('@/assets/stadiums/coors-field.jpg'),
  'dodger-stadium': require('@/assets/stadiums/dodger-stadium.jpg'),
  'petco-park': require('@/assets/stadiums/petco-park.jpg'),
  'oracle-park': require('@/assets/stadiums/oracle-park.jpg'),
};

export function getStadiumImage(stadiumId: string): ImageSourcePropType | undefined {
  return STADIUM_IMAGES[stadiumId];
}
