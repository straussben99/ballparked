import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[stadiumId]"
        options={{
          headerTransparent: true,
          headerTitle: '',
          headerBackVisible: true,
          headerTintColor: '#1A1A2E',
        }}
      />
    </Stack>
  );
}
