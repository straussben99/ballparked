import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Typography, FontWeight } from '@/constants/typography';
import { getStadiumById } from '@/data/stadiums';
import { getStadiumImage } from '@/data/stadium-images';
import { RATING_CATEGORIES } from '@/types/rating';

interface ShareCardProps {
  stadiumId: string;
  overall: number;
  scores: { vibes: number; food: number; views: number; identity: number; accessibility: number };
  userName: string;
}

export const ShareCard = forwardRef<ViewShot, ShareCardProps>(
  ({ stadiumId, overall, scores, userName }, ref) => {
    const stadium = getStadiumById(stadiumId);
    const image = getStadiumImage(stadiumId);

    return (
      <ViewShot ref={ref} options={{ format: 'png', quality: 1.0 }}>
        <View style={styles.card}>
          {/* Stadium Image */}
          {image && <Image source={image} style={styles.heroImage} />}

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.headerRow}>
              <View style={styles.headerInfo}>
                <Text style={styles.stadiumName}>{stadium?.name || stadiumId}</Text>
                <Text style={styles.teamName}>{stadium?.team}</Text>
              </View>
              <View style={styles.overallBadge}>
                <Text style={styles.overallScore}>{overall.toFixed(1)}</Text>
              </View>
            </View>

            {/* Category Scores */}
            <View style={styles.scoresRow}>
              <ScoreItem emoji="🔥" label="Vibes" score={scores.vibes} />
              <ScoreItem emoji="🍔" label="Food" score={scores.food} />
              <ScoreItem emoji="👀" label="Views" score={scores.views} />
              <ScoreItem emoji="🏟️" label="Identity" score={scores.identity} />
              <ScoreItem emoji="🚗" label="Access" score={scores.accessibility} />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.userName}>Rated by {userName}</Text>
              <Text style={styles.branding}>BallParked</Text>
            </View>
          </View>
        </View>
      </ViewShot>
    );
  }
);

function ScoreItem({ emoji, label, score }: { emoji: string; label: string; score: number }) {
  return (
    <View style={styles.scoreItem}>
      <Text style={styles.scoreEmoji}>{emoji}</Text>
      <Text style={styles.scoreValue}>{score}</Text>
      <Text style={styles.scoreLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 360,
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroImage: { width: 360, height: 180 },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerInfo: { flex: 1 },
  stadiumName: { fontSize: 22, fontWeight: '700', color: Colors.primary.navy },
  teamName: { fontSize: 14, color: Colors.text.secondary, marginTop: 2 },
  overallBadge: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.accent.coral,
    alignItems: 'center', justifyContent: 'center',
  },
  overallScore: { fontSize: 20, fontWeight: '800', color: Colors.text.inverse },
  scoresRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  scoreItem: { alignItems: 'center' },
  scoreEmoji: { fontSize: 18, marginBottom: 4 },
  scoreValue: { fontSize: 16, fontWeight: '700', color: Colors.primary.navy },
  scoreLabel: { fontSize: 10, color: Colors.text.tertiary, marginTop: 2 },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.card.border, paddingTop: 12,
  },
  userName: { fontSize: 12, color: Colors.text.secondary },
  branding: { fontSize: 14, fontWeight: '700', color: Colors.primary.navy, letterSpacing: 0.5 },
});
