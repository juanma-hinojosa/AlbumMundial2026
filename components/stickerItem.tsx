import { StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence
} from 'react-native-reanimated';
import { useEffect } from 'react';
import hapticFeedback from '@/utils/haptics';

interface Sticker {
  codigo: string;
  id: number;
}

export const StickerItem = ({ item, quantity = 0, onToggle, onDecrement }: { item: Sticker; quantity?: number; onToggle: () => void; onDecrement: () => void }) => {
  const isOwned = quantity > 0;
  const isRepeated = quantity > 1;

  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(isOwned ? 1 : 0.6);
  const badgeScale = useSharedValue(isRepeated ? 1 : 0);

  // Update animations when quantity changes
  useEffect(() => {
    opacity.value = withTiming(isOwned ? 1 : 0.6, { duration: 300 });
    badgeScale.value = withSpring(isRepeated ? 1 : 0, {
      damping: 8,
      stiffness: 200,
    });
  }, [isOwned, isRepeated]);

  const handlePress = () => {
    hapticFeedback.light();
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 6, stiffness: 200 })
    );
    onToggle();
  };

  const handleLongPress = () => {
    if (quantity > 0) {
      hapticFeedback.medium();
      scale.value = withSequence(
        withTiming(0.9, { duration: 150 }),
        withSpring(1, { damping: 6, stiffness: 200 })
      );
      onDecrement();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={400}
        style={[styles.container, isOwned ? styles.owned : styles.missing]}
        activeOpacity={0.8}
      >
        <Text style={[styles.codeText, isOwned && styles.ownedText]}>
          {item.codigo}
        </Text>

        {isRepeated && (
          <Animated.View style={[styles.badge, badgeAnimatedStyle]}>
            <Text style={styles.badgeText}>{quantity}</Text>
          </Animated.View>
        )}

        {isOwned && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 8,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missing: {
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
    borderColor: 'rgba(200, 200, 200, 0.6)',
  },
  owned: {
    backgroundColor: '#ffffff',
    borderColor: '#4ECDC4',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  codeText: {
    fontSize: Platform.OS === 'web' ? 12 : 11,
    fontWeight: '600',
    color: 'rgba(26, 26, 46, 0.6)',
    textAlign: 'center',
  },
  ownedText: {
    color: '#1a1a2e',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  checkmark: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4ECDC4',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
});