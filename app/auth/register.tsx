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
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { Typography, FontWeight } from '@/constants/typography';

export default function RegisterScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!displayName || !username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      setError(
        'Username must be 3-20 characters and contain only lowercase letters, numbers, and underscores.'
      );
      return;
    }

    setError('');
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          display_name: displayName.trim(),
          username: normalizedUsername,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Join the community and start tracking your ballpark journey.
        </Text>

        <View style={styles.form}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Alex Johnson"
            placeholderTextColor={Colors.text.tertiary}
            editable={!loading}
          />

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="alexj"
            placeholderTextColor={Colors.text.tertiary}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

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
            placeholder="Min 8 characters"
            placeholderTextColor={Colors.text.tertiary}
            secureTextEntry
            editable={!loading}
          />
          <Text style={styles.hint}>Must be at least 8 characters</Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={Colors.accent.coral}
              style={styles.loader}
            />
          ) : (
            <Button
              title="Create Account"
              onPress={handleSignUp}
              variant="primary"
              size="lg"
              fullWidth
            />
          )}

          <Text style={styles.switchText}>
            Already have an account?{' '}
            <Text
              style={styles.switchLink}
              onPress={() => router.back()}
            >
              Sign In
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
  title: {
    ...Typography.h2,
    color: Colors.primary.navy,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing['2xl'],
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
  hint: {
    ...Typography.small,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  loader: {
    marginTop: Spacing.xl,
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
