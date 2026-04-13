import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Layout } from '@/constants/spacing';
import { FontSize, FontWeight, Typography } from '@/constants/typography';
import { useCommentStore } from '@/stores/useCommentStore';
import { useAuthStore } from '@/stores/useAuthStore';

interface CommentSectionProps {
  ratingId: string;
  stadiumId: string;
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return date.toLocaleDateString();
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function CommentSection({ ratingId, stadiumId }: CommentSectionProps) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const fetchComments = useCommentStore((s) => s.fetchComments);
  const addComment = useCommentStore((s) => s.addComment);
  const deleteComment = useCommentStore((s) => s.deleteComment);
  const isLoading = useCommentStore((s) => s.isLoading);
  const commentsMap = useCommentStore((s) => s.comments);
  const comments = commentsMap[ratingId] ?? [];
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    fetchComments(ratingId);
  }, [ratingId]);

  const handleSend = async () => {
    if (!text.trim() || !user || isSending) return;
    setIsSending(true);
    try {
      await addComment(ratingId, user.id, text.trim());
      setText('');
    } catch {
      Alert.alert('Error', 'Could not post comment. Try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = (commentId: string) => {
    Alert.alert('Delete Comment', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteComment(commentId, ratingId),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comments</Text>

      {isLoading && comments.length === 0 ? (
        <ActivityIndicator color={Colors.accent.coral} style={styles.loader} />
      ) : comments.length === 0 ? (
        <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
      ) : (
        comments.map((comment) => {
          const isOwn = user?.id === comment.user_id;
          return (
            <View key={comment.id} style={styles.commentRow}>
              <Pressable
                style={styles.commentTappable}
                onPress={() =>
                  router.push({ pathname: '/user/[userId]', params: { userId: comment.user_id } } as any)
                }
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(comment.display_name)}
                  </Text>
                </View>
                <View style={styles.commentBody}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.displayName}>
                      {comment.display_name ?? 'User'}
                    </Text>
                    {comment.username && (
                      <Text style={styles.username}>@{comment.username}</Text>
                    )}
                    <Text style={styles.timestamp}>
                      {getRelativeTime(comment.created_at)}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              </Pressable>
              {isOwn && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(comment.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={18}
                    color={Colors.text.tertiary}
                  />
                </TouchableOpacity>
              )}
            </View>
          );
        })
      )}

      {isAuthenticated && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Add a comment..."
            placeholderTextColor={Colors.text.tertiary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!text.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!text.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator color={Colors.text.inverse} size="small" />
            ) : (
              <Ionicons name="send" size={18} color={Colors.text.inverse} />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
  },
  title: {
    ...Typography.captionBold,
    color: Colors.primary.navy,
    marginBottom: Spacing.sm,
  },
  loader: {
    marginVertical: Spacing.base,
  },
  emptyText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  commentTappable: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  avatar: {
    width: Layout.avatarSize.sm,
    height: Layout.avatarSize.sm,
    borderRadius: Layout.avatarSize.sm / 2,
    backgroundColor: Colors.primary.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.inverse,
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  displayName: {
    ...Typography.smallBold,
    color: Colors.primary.navy,
  },
  username: {
    ...Typography.small,
    color: Colors.text.tertiary,
  },
  timestamp: {
    ...Typography.tiny,
    color: Colors.text.tertiary,
  },
  commentText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  deleteButton: {
    paddingLeft: Spacing.sm,
    paddingTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background.white,
    borderWidth: 1,
    borderColor: Colors.card.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    maxHeight: 80,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
