import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background.cream },
        headerTintColor: Colors.primary.navy,
        headerTitleStyle: { ...Typography.bodyBold },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.background.cream },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="terms" options={{ title: 'Terms of Use' }} />
      <Stack.Screen name="credits" options={{ title: 'Credits' }} />
    </Stack>
  );
}
