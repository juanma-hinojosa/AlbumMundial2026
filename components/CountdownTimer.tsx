import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

const CountdownTimer: React.FC<{ targetDate: string | Date }> = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    if (difference <= 0) {
      return { days: "00", hours: "00", minutes: "00", seconds: "00" };
    }
    return {
      days: String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, '0'),
      hours: String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
      minutes: String(Math.floor((difference / 1000 / 60) % 60)).padStart(2, '0'),
      seconds: String(Math.floor((difference / 1000) % 60)).padStart(2, '0')
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  // Shared values para la animación del texto
  const daysScale = useSharedValue(1);
  const hoursScale = useSharedValue(1);
  const minutesScale = useSharedValue(1);
  const secondsScale = useSharedValue(1);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();

      const triggerAnim = (sharedVal: any) => {
        sharedVal.value = withSequence(
          withTiming(1.15, { duration: 100 }), // Un poco menos agresivo
          withSpring(1, { damping: 10, stiffness: 150 })
        );
      };

      if (newTimeLeft.seconds !== timeLeft.seconds) triggerAnim(secondsScale);
      if (newTimeLeft.minutes !== timeLeft.minutes) triggerAnim(minutesScale);
      if (newTimeLeft.hours !== timeLeft.hours) triggerAnim(hoursScale);
      if (newTimeLeft.days !== timeLeft.days) triggerAnim(daysScale);

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, timeLeft]);

  const createAnimatedStyle = (scaleValue: any) => useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  // Render individual de cada unidad para limpiar el JSX principal
  const TimeUnit = ({ value, label, animStyle }: any) => (
    <View style={styles.timeBox}>
      <Animated.Text style={[styles.number, animStyle]}>
        {value}
      </Animated.Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TimeUnit value={timeLeft.days} label="Días" animStyle={createAnimatedStyle(daysScale)} />
      <Separator />
      <TimeUnit value={timeLeft.hours} label="Horas" animStyle={createAnimatedStyle(hoursScale)} />
      <Separator />
      <TimeUnit value={timeLeft.minutes} label="Min" animStyle={createAnimatedStyle(minutesScale)} />
      <Separator />
      <TimeUnit value={timeLeft.seconds} label="Seg" animStyle={createAnimatedStyle(secondsScale)} />
    </View>
  );
};

const Separator = () => (
  <View style={styles.separator}>
    <View style={styles.dot} />
    <View style={styles.dot} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: '100%',
    paddingHorizontal: 10,
  },
  timeBox: {
    // Eliminamos flex: 1 para evitar que empujen hacia afuera
    alignItems: "center",
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    width: screenWidth > 400 ? 75 : 65, // Ancho dinámico según pantalla
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  number: {
    fontSize: Platform.OS === 'web' ? 28 : 24, // Reducido ligeramente para evitar desbordes
    fontWeight: "800",
    color: "#ffffff",
  },
  label: {
    fontSize: 9,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
    textTransform: 'uppercase',
    marginTop: 2,
  },
  separator: {
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  dot: {
    width: 3,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 1.5,
    marginVertical: 2,
  },
});

export default CountdownTimer;