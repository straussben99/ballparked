import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { AppleSignInButton } from '@/components/auth/AppleSignInButton';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { SocialAuthDivider } from '@/components/auth/SocialAuthDivider';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { Typography, FontSize, FontWeight } from '@/constants/typography';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>&#9918;</Text>
          <Text style={styles.title}>BallParked</Text>
          <Text style={styles.subtitle}>
            Rate every park. Track your journey.
          </Text>
        </View>

        <View style={styles.form}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={Colors.text.tertiary}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            placeholderTextColor={Colors.text.tertiary}
            secureTextEntry
            editable={!loading}
          />

          <View style={styles.buttonWrapper}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color={Colors.accent.coral}
              />
            ) : (
              <Button
                title="Sign In"
                onPress={handleSignIn}
                variant="primary"
                size="lg"
                fullWidth
              />
            )}
          </View>

          <SocialAuthDivider />
          <AppleSignInButton />
          <GoogleSignInButton />

          <Text style={styles.switchText}>
            Don't have an account?{' '}
            <Text
              style={styles.switchLink}
              onPress={() => router.push('/auth/register')}
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  emoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.primary.navy,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  form: {
    width: '100%',
  },
  label: {
    ...Typography.captionBold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.base,
  },
  input: {
    backgroundColor: Colors.background.white,
    borderWidth: 1,
    borderColor: Colors.card.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    ...Typography.body,
    color: Colors.text.primary,
  },
  buttonWrapper: {
    marginTop: Spacing['2xl'],
  },
  error: {
    ...Typography.caption,
    color: Colors.semantic.error,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  switchText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  switchLink: {
    color: Colors.accent.coral,
    fontWeight: FontWeight.semiBold,
  },
});
