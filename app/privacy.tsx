import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Layout } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updated}>Last updated: April 2026</Text>

        <Text style={styles.heading}>Information We Collect</Text>
        <Text style={styles.body}>
          When you create an account, we collect your email address, display name, and username. You may optionally provide a profile photo, bio, and favorite team. When you use the app, we collect your stadium ratings, comments, and photos you upload.
        </Text>

        <Text style={styles.heading}>How We Use Your Information</Text>
        <Text style={styles.body}>
          We use your information to provide and improve the BallParked service, including displaying your profile and ratings to other users, sending push notifications you've opted into, and generating leaderboards and community statistics.
        </Text>

        <Text style={styles.heading}>Data Sharing</Text>
        <Text style={styles.body}>
          Your public profile information, ratings, and comments are visible to other BallParked users. We do not sell your personal information to third parties. We may share anonymized, aggregated data for analytics purposes.
        </Text>

        <Text style={styles.heading}>Data Storage</Text>
        <Text style={styles.body}>
          Your data is stored securely using Supabase, which uses industry-standard encryption. Authentication tokens are stored locally on your device using secure storage.
        </Text>

        <Text style={styles.heading}>Your Rights</Text>
        <Text style={styles.body}>
          You can update or delete your profile information at any time through the app settings. You can request deletion of your account and all associated data by contacting us.
        </Text>

        <Text style={styles.heading}>Push Notifications</Text>
        <Text style={styles.body}>
          If you opt in, we send push notifications for new followers, comments on your ratings, and when people you follow rate stadiums. You can disable notifications at any time through your device settings.
        </Text>

        <Text style={styles.heading}>Contact</Text>
        <Text style={styles.body}>
          For privacy-related questions, contact us at privacy@ballparked.com.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.cream },
  scroll: { padding: Layout.screenPadding, paddingBottom: 60 },
  title: { ...Typography.h2, color: Colors.primary.navy, marginBottom: Spacing.xs },
  updated: { ...Typography.small, color: Colors.text.tertiary, marginBottom: Spacing.xl },
  heading: { ...Typography.bodyBold, color: Colors.primary.navy, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  body: { ...Typography.body, color: Colors.text.secondary, lineHeight: 22 },
});
