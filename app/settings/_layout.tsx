import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

export default function SettingsLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background.cream },
        headerTintColor: Colors.primary.navy,
        headerTitleStyle: { ...Typography.bodyBold },
        headerShadowVisible: false,
        headerBackTitle: '',
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: Colors.background.cream },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
              <Ionicons name="chevron-back" size={28} color={Colors.primary.navy} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="terms" options={{ title: 'Terms of Use' }} />
      <Stack.Screen name="credits" options={{ title: 'Credits' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="delete-account" options={{ title: 'Delete Account' }} />
    </Stack>
  );
}
