import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Fallbacks mirror app.json -> expo.extra. Anon key is public by design.
// Needed because Constants.expoConfig.extra isn't always populated in local dev.
const FALLBACK_SUPABASE_URL = 'https://qsodeogjotqjdevkrogt.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzb2Rlb2dqb3RxamRldmtyb2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDQzMzIsImV4cCI6MjA5MDcyMDMzMn0.RBZ74r5bsAV7DagD134Kv1RTqe6taZk1tlit9etBzww';

const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl || FALLBACK_SUPABASE_URL;
const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey || FALLBACK_SUPABASE_ANON_KEY;

// SecureStore adapter for auth token persistence (native only)
const SecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
