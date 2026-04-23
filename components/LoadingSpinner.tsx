import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: any;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando...',
  size = 'medium',
  color = '#2A398D',
  style
}) => {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.8);

  // Breathing animation
  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    scale.value = withRepeat(
      withSpring(1, {
        damping: 3,
        stiffness: 100,
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const getSizeProps = () => {
    switch (size) {
      case 'small':
        return { size: 24, fontSize: 14 };
      case 'large':
        return { size: 48, fontSize: 18 };
      default:
        return { size: 32, fontSize: 16 };
    }
  };

  const { size: spinnerSize, fontSize } = getSizeProps();

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <ActivityIndicator size={spinnerSize} color={color} />
        {message && (
          <Text style={[styles.message, { fontSize, color }]}>
            {message}
          </Text>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },
});

export default LoadingSpinner;