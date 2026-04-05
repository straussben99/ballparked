import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Layout } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.updated}>Effective Date: April 2026</Text>
      <Text style={styles.intro}>
        BallParked ("we," "our," or "us") is committed to protecting your privacy. This Privacy
        Policy explains how we collect, use, and safeguard your information when you use our
        mobile application.
      </Text>

      <Text style={styles.heading}>1. Information We Collect</Text>
      <Text style={styles.body}>
        When you create an account, we collect your email address, display name, and username.
        You may optionally provide a profile photo, bio, and favorite MLB team.
      </Text>
      <Text style={styles.body}>
        As you use BallParked, we collect the stadium ratings, reviews, comments, and photos you
        submit. We also collect basic usage data such as which screens you visit and when you
        open the app, to help us understand how the app is used and improve the experience.
      </Text>

      <Text style={styles.heading}>2. How We Use Your Information</Text>
      <Text style={styles.body}>
        We use your information to: provide and operate the BallParked service; display your
        profile, ratings, and activity to other users in the social feed; generate leaderboards
        and community statistics; send push notifications you have opted into (new followers,
        comments, and activity from people you follow); and improve, analyze, and develop the
        app.
      </Text>

      <Text style={styles.heading}>3. Data Storage and Security</Text>
      <Text style={styles.body}>
        Your data is stored securely using Supabase, a cloud-based platform that employs
        industry-standard encryption for data in transit and at rest. Authentication tokens are
        stored locally on your device using secure storage provided by the operating system.
      </Text>

      <Text style={styles.heading}>4. Third-Party Services</Text>
      <Text style={styles.body}>
        BallParked relies on the following third-party services: Supabase for backend
        infrastructure, authentication, and database storage; Expo for app delivery, updates,
        and push notifications. These services have their own privacy policies and we encourage
        you to review them.
      </Text>

      <Text style={styles.heading}>5. Data Sharing</Text>
      <Text style={styles.body}>
        Your public profile information, ratings, and comments are visible to other BallParked
        users. We do not sell your personal information to third parties. We may share
        anonymized, aggregated data for analytics purposes.
      </Text>

      <Text style={styles.heading}>6. Your Rights</Text>
      <Text style={styles.body}>
        You may update your profile information at any time through the app. You may request
        deletion of your account and all associated data by contacting us. You may export your
        data by contacting us. You may opt out of push notifications at any time through your
        device settings.
      </Text>

      <Text style={styles.heading}>7. Children's Privacy</Text>
      <Text style={styles.body}>
        BallParked is not intended for use by anyone under the age of 13. We do not knowingly
        collect personal information from children under 13. If we become aware that we have
        collected such information, we will take steps to delete it promptly.
      </Text>

      <Text style={styles.heading}>8. Changes to This Policy</Text>
      <Text style={styles.body}>
        We may update this Privacy Policy from time to time. We will notify you of material
        changes through the app or by email. Continued use of BallParked after changes
        constitutes acceptance of the updated policy.
      </Text>

      <Text style={styles.heading}>9. Contact</Text>
      <Text style={styles.body}>
        For privacy-related questions or requests, contact us at strauss.ben99@gmail.com.
      </Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Developer: Ben Strauss</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  scroll: {
    padding: Layout.screenPadding,
    paddingBottom: 60,
  },
  updated: {
    ...Typography.small,
    color: Colors.text.tertiary,
    marginBottom: Spacing.lg,
  },
  intro: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  heading: {
    ...Typography.bodyBold,
    color: Colors.primary.navy,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  body: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  footer: {
    marginTop: Spacing['2xl'],
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.card.border,
    alignItems: 'center',
  },
  footerText: {
    ...Typography.small,
    color: Colors.text.tertiary,
  },
});
