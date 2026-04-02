import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#FFF8F0' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="stadium/[stadiumId]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="rate/[stadiumId]"
          options={{ presentation: 'modal', title: 'Rate Stadium' }}
        />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
