import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRatingStore } from '@/stores/useRatingStore';
import { Colors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated but on auth screen
      router.replace('/');
    }
  }, [isAuthenticated, segments]);
}

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const setSession = useAuthStore((s) => s.setSession);
  const fetchUserRatings = useRatingStore((s) => s.fetchUserRatings);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserRatings(session.user.id);
      }
      setInitializing(false);
      SplashScreen.hideAsync();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserRatings(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.accent.coral} />
        <StatusBar style="dark" />
      </View>
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  useProtectedRoute();

  return (
    <>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: Colors.background.cream },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.cream,
  },
});
