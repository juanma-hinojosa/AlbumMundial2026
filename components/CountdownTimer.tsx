import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence
} from 'react-native-reanimated';

const CountdownTimer: React.FC<{ targetDate: string | Date }> = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();

    if (difference <= 0) {
      return {
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00"
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  // Animation values for each time unit
  const daysScale = useSharedValue(1);
  const hoursScale = useSharedValue(1);
  const minutesScale = useSharedValue(1);
  const secondsScale = useSharedValue(1);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();

      // Animate when seconds change
      if (newTimeLeft.seconds !== timeLeft.seconds) {
        secondsScale.value = withSequence(
          withTiming(1.2, { duration: 100 }),
          withSpring(1, { damping: 8, stiffness: 200 })
        );
      }

      // Animate when minutes change
      if (newTimeLeft.minutes !== timeLeft.minutes) {
        minutesScale.value = withSequence(
          withTiming(1.2, { duration: 150 }),
          withSpring(1, { damping: 8, stiffness: 200 })
        );
      }

      // Animate when hours change
      if (newTimeLeft.hours !== timeLeft.hours) {
        hoursScale.value = withSequence(
          withTiming(1.2, { duration: 200 }),
          withSpring(1, { damping: 8, stiffness: 200 })
        );
      }

      // Animate when days change
      if (newTimeLeft.days !== timeLeft.days) {
        daysScale.value = withSequence(
          withTiming(1.2, { duration: 250 }),
          withSpring(1, { damping: 8, stiffness: 200 })
        );
      }

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, timeLeft]);

  const createAnimatedStyle = (scaleValue: any) => useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const daysAnimatedStyle = createAnimatedStyle(daysScale);
  const hoursAnimatedStyle = createAnimatedStyle(hoursScale);
  const minutesAnimatedStyle = createAnimatedStyle(minutesScale);
  const secondsAnimatedStyle = createAnimatedStyle(secondsScale);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.timeBox, daysAnimatedStyle]}>
        <Text style={styles.number}>{timeLeft.days}</Text>
        <Text style={styles.label}>Días</Text>
      </Animated.View>

      <View style={styles.separator}>
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <Animated.View style={[styles.timeBox, hoursAnimatedStyle]}>
        <Text style={styles.number}>{timeLeft.hours}</Text>
        <Text style={styles.label}>Horas</Text>
      </Animated.View>

      <View style={styles.separator}>
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <Animated.View style={[styles.timeBox, minutesAnimatedStyle]}>
        <Text style={styles.number}>{timeLeft.minutes}</Text>
        <Text style={styles.label}>Minutos</Text>
      </Animated.View>

      <View style={styles.separator}>
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <Animated.View style={[styles.timeBox, secondsAnimatedStyle]}>
        <Text style={styles.number}>{timeLeft.seconds}</Text>
        <Text style={styles.label}>Segundos</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  timeBox: {
    alignItems: "center",
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: Platform.OS === 'web' ? 80 : 70,
  },
  number: {
    fontSize: Platform.OS === 'web' ? 36 : 32,
    fontWeight: "800",
    color: "#ffffff",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  label: {
    fontSize: Platform.OS === 'web' ? 12 : 10,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  separator: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 2,
    marginVertical: 1,
  },
});

export default CountdownTimer;