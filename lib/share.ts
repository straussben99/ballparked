import * as Sharing from 'expo-sharing';
import { RefObject } from 'react';

export async function shareRatingCard(viewRef: RefObject<any>) {
  try {
    const available = await Sharing.isAvailableAsync();
    if (!available) return false;

    const uri = await viewRef.current?.capture?.();
    if (!uri) return false;

    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      UTI: 'public.png',
    });
    return true;
  } catch (err) {
    console.error('Share failed:', err);
    return false;
  }
}
