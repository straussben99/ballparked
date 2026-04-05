import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Layout } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Terms of Use</Text>
        <Text style={styles.updated}>Last updated: April 2026</Text>

        <Text style={styles.heading}>1. Acceptance of Terms</Text>
        <Text style={styles.body}>
          By downloading, installing, or using BallParked, you agree to be bound by these Terms of Use. If you do not agree to these terms, do not use the app.
        </Text>

        <Text style={styles.heading}>2. Description of Service</Text>
        <Text style={styles.body}>
          BallParked is a mobile application that allows users to rate, review, and track their visits to Major League Baseball stadiums. Users can share ratings, follow other users, and participate in community features.
        </Text>

        <Text style={styles.heading}>3. User Accounts</Text>
        <Text style={styles.body}>
          You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information when creating your account. You must be at least 13 years old to create an account.
        </Text>

        <Text style={styles.heading}>4. User Content</Text>
        <Text style={styles.body}>
          You retain ownership of content you submit (ratings, comments, photos). By submitting content, you grant BallParked a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content within the app. You agree not to submit content that is offensive, defamatory, or violates the rights of others.
        </Text>

        <Text style={styles.heading}>5. Prohibited Conduct</Text>
        <Text style={styles.body}>
          You agree not to: create fake accounts or impersonate others; submit false or misleading ratings; harass or bully other users; attempt to gain unauthorized access to the service; use the app for any illegal purpose.
        </Text>

        <Text style={styles.heading}>6. Termination</Text>
        <Text style={styles.body}>
          We reserve the right to suspend or terminate your account at any time for violations of these terms. You may delete your account at any time.
        </Text>

        <Text style={styles.heading}>7. Disclaimer</Text>
        <Text style={styles.body}>
          BallParked is provided "as is" without warranties of any kind. We do not guarantee the accuracy of user-submitted ratings or reviews. BallParked is not affiliated with Major League Baseball or any MLB team.
        </Text>

        <Text style={styles.heading}>8. Changes to Terms</Text>
        <Text style={styles.body}>
          We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the new terms.
        </Text>

        <Text style={styles.heading}>9. Contact</Text>
        <Text style={styles.body}>
          Questions about these terms? Contact us at support@ballparked.com.
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
