import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Layout } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

export default function TermsOfUseScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.updated}>Effective Date: April 2026</Text>
      <Text style={styles.intro}>
        Please read these Terms of Use carefully before using BallParked. By accessing or using
        the app, you agree to be bound by these terms.
      </Text>

      <Text style={styles.heading}>1. Acceptance of Terms</Text>
      <Text style={styles.body}>
        By downloading, installing, or using BallParked, you agree to these Terms of Use. If you
        do not agree, do not use the app. We may update these terms from time to time, and your
        continued use constitutes acceptance of any changes.
      </Text>

      <Text style={styles.heading}>2. Account Responsibilities</Text>
      <Text style={styles.body}>
        You must provide accurate and complete information when creating your account. You are
        responsible for maintaining the security of your password and account. You must be at
        least 13 years old to create an account. You are responsible for all activity that
        occurs under your account.
      </Text>

      <Text style={styles.heading}>3. User Content</Text>
      <Text style={styles.body}>
        You retain ownership of content you submit, including ratings, reviews, comments, and
        photos. By submitting content, you grant BallParked a non-exclusive, worldwide,
        royalty-free license to use, display, reproduce, and distribute your content within the
        app and for promotional purposes. You represent that you have the right to submit any
        content you provide.
      </Text>

      <Text style={styles.heading}>4. Prohibited Conduct</Text>
      <Text style={styles.body}>
        You agree not to: harass, bully, or threaten other users; submit false, misleading, or
        spam ratings and reviews; create fake accounts or impersonate others; attempt to gain
        unauthorized access to the service or other users' accounts; use the app for any illegal
        purpose; scrape or collect data from the app without permission; or interfere with the
        proper functioning of the service.
      </Text>

      <Text style={styles.heading}>5. Intellectual Property</Text>
      <Text style={styles.body}>
        The BallParked name, logo, and branding are the property of BallParked. MLB team names,
        stadium names, logos, and related marks are trademarks of their respective owners and are
        used for informational purposes. Stadium data is compiled from publicly available sources
        and used under fair use principles.
      </Text>

      <Text style={styles.heading}>6. Disclaimer</Text>
      <Text style={styles.body}>
        BallParked is provided "as is" without warranties of any kind, express or implied. User
        ratings and reviews represent personal opinions and are not endorsed by BallParked, Major
        League Baseball, or any MLB team. We do not guarantee the accuracy, completeness, or
        reliability of any user-submitted content.
      </Text>

      <Text style={styles.heading}>7. Limitation of Liability</Text>
      <Text style={styles.body}>
        To the fullest extent permitted by law, BallParked and its developer shall not be liable
        for any indirect, incidental, special, consequential, or punitive damages arising from
        your use of or inability to use the app, including loss of data or unauthorized access to
        your account.
      </Text>

      <Text style={styles.heading}>8. Termination</Text>
      <Text style={styles.body}>
        We reserve the right to suspend or terminate your account at any time for violations of
        these terms, without prior notice. You may delete your account at any time through the
        app or by contacting us. Upon termination, your right to use the app ceases immediately.
      </Text>

      <Text style={styles.heading}>9. Changes to Terms</Text>
      <Text style={styles.body}>
        We may modify these Terms of Use at any time. Material changes will be communicated
        through the app. Your continued use after changes are posted constitutes acceptance of
        the revised terms.
      </Text>

      <Text style={styles.heading}>10. Contact</Text>
      <Text style={styles.body}>
        Questions about these terms? Contact us at strauss.ben99@gmail.com.
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
