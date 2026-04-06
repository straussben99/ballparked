import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: '',
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[stadiumId]"
        options={{
          headerTransparent: true,
          headerTitle: '',
          headerBackVisible: true,
          headerTintColor: '#FFFFFF',
        }}
      />
    </Stack>
  );
}
