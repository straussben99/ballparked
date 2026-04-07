import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRatingStore } from '@/stores/useRatingStore';
import { useSocialStore } from '@/stores/useSocialStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { registerForPushNotifications, setupNotificationListeners } from '@/lib/notifications';
import { Colors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profile = useAuthStore((s) => s.profile);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/');
    } else if (isAuthenticated && profile && !profile.has_onboarded && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, profile, segments]);
}

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const setSession = useAuthStore((s) => s.setSession);
  const fetchUserRatings = useRatingStore((s) => s.fetchUserRatings);
  const fetchFollowing = useSocialStore((s) => s.fetchFollowing);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        try {
          fetchUserRatings(session.user.id);
          fetchFollowing(session.user.id);
          fetchWishlist(session.user.id);
          registerForPushNotifications(session.user.id).catch(console.error);
        } catch (err) {
          console.error('Failed to initialize user data:', err);
        }
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
        fetchFollowing(session.user.id);
        fetchWishlist(session.user.id);
        registerForPushNotifications(session.user.id).catch(console.error);
      }
    });

    const cleanupNotifications = setupNotificationListeners();

    return () => {
      subscription.unsubscribe();
      cleanupNotifications();
    };
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
          headerBackTitle: '',
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen
          name="rate/[stadiumId]"
          options={{ presentation: 'modal', title: 'Rate Stadium' }}
        />
        <Stack.Screen
          name="rating/[ratingId]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="settings"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="leaderboard"
          options={{ title: 'Leaderboard' }}
        />
        <Stack.Screen
          name="compare"
          options={{ title: 'Compare Stadiums', headerShown: false }}
        />
        <Stack.Screen
          name="best-of"
          options={{ title: 'Best Of', headerShown: false }}
        />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
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
