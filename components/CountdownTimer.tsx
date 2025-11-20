import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const CountdownTimer = ({ targetDate }) => {
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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <View style={styles.container}>
      <View style={styles.timeBox}>
        <Text style={styles.number}>{timeLeft.days}</Text>
        <Text style={styles.label}>Días</Text>
      </View>

      <View style={styles.timeBox}>
        <Text style={styles.number}>{timeLeft.hours}</Text>
        <Text style={styles.label}>Horas</Text>
      </View>

      <View style={styles.timeBox}>
        <Text style={styles.number}>{timeLeft.minutes}</Text>
        <Text style={styles.label}>Minutos</Text>
      </View>

      <View style={styles.timeBox}>
        <Text style={styles.number}>{timeLeft.seconds}</Text>
        <Text style={styles.label}>Segundos</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  timeBox: {
    alignItems: "center",
    padding: 5,
  },
  number: {
    fontSize: 62,
    fontWeight: "bold",
    color: "#D1D4D1"
  },
  label: {
    fontSize: 14,
    color: "#D1D4D1",
  },
});

export default CountdownTimer;
