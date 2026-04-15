import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Register for push notifications and save token to Supabase
export async function registerForPushNotifications(userId: string) {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });
  const token = tokenData.data;

  // Store in Supabase for future remote push notifications
  await supabase.from('push_tokens').upsert(
    {
      user_id: userId,
      token,
      platform: Platform.OS,
    },
    { onConflict: 'user_id,token' }
  );

  // Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return token;
}

// Send a local notification (works without a server — shows on THIS device only)
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
      sound: 'default',
    },
    trigger: null, // Show immediately
  });
}

// Send a push notification to a specific user via Expo Push API.
// Looks up the user's push token from Supabase and sends the notification
// to THEIR device (not the current device).
export async function sendPushToUser(
  targetUserId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  try {
    // Fetch the target user's push tokens
    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', targetUserId);

    if (error || !tokens || tokens.length === 0) {
      // User has no push token registered — they may not have enabled notifications
      return;
    }

    // Send push notification via Expo's push API
    const messages = tokens.map((t: { token: string }) => ({
      to: t.token,
      sound: 'default',
      title,
      body,
      data: data ?? {},
    }));

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });
  } catch (err) {
    console.error('Failed to send push notification:', err);
  }
}

// Handle notification taps — navigate to the relevant screen
function handleNotificationResponse(
  response: Notifications.NotificationResponse
) {
  const data = response.notification.request.content.data;

  if (data?.type === 'follow' && data?.userId) {
    // Navigate to the follower's profile
    router.push({ pathname: '/user/[userId]', params: { userId: data.userId as string } } as any);
  } else if (data?.type === 'comment' && data?.ratingId) {
    // Navigate to the rating that was commented on
    router.push(`/rating/${data.ratingId}` as any);
  }
}

// Set up listeners for incoming notifications and tap responses
export function setupNotificationListeners() {
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      // Notification received while app is in foreground — no-op for now
      console.log('Notification received:', notification.request.content.title);
    }
  );

  const responseListener =
    Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}
