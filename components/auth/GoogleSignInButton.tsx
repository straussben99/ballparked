import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Typography, FontWeight } from '@/constants/typography';

WebBrowser.maybeCompleteAuthSession();

// TODO: Replace with your Google Cloud iOS Client ID
const GOOGLE_IOS_CLIENT_ID = 'YOUR_GOOGLE_IOS_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_WEB_CLIENT_ID = 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';

const discovery = AuthSession.useAutoDiscovery
  ? undefined
  : {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    };

export function GoogleSignInButton() {
  const [loading, setLoading] = React.useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const redirectUri = AuthSession.makeRedirectUri({ scheme: 'ballparked' });

      const result = await AuthSession.startAsync({
        authUrl:
          `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${GOOGLE_WEB_CLIENT_ID}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_type=token` +
          `&scope=${encodeURIComponent('openid email profile')}`,
      });

      if (result.type === 'success' && result.params?.access_token) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: result.params.access_token,
          access_token: result.params.access_token,
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Google Sign-In error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleGoogleSignIn}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Colors.text.primary} />
      ) : (
        <Text style={styles.text}>Continue with Google</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.white,
    borderWidth: 1,
    borderColor: Colors.card.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    height: 50,
  },
  text: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
  },
});
