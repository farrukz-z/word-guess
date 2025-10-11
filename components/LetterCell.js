// components/LetterCell.js
import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const LetterCell = ({ letter = "", revealed = false, status = "neutral", onPress = () => {} }) => {
  const scale = useRef(new Animated.Value(0.95)).current;
  const textOpacity = useRef(new Animated.Value(revealed ? 1 : 0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (revealed) {
      textOpacity.setValue(1);
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.05, duration: 120, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 0.95, friction: 8, useNativeDriver: true }),
      ]).start();
    }
  }, [revealed, textOpacity, scale]);

  useEffect(() => {
    if (status === "correct") {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.12, duration: 120, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]).start();
    } else if (status === "wrong") {
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [status, scale, shake]);

  const translateX = shake.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-6, 0, 6],
  });

  const bg = status === "correct" ? "#22c55e" : status === "wrong" ? "#ef4444" : "#1e293b";
  const border = status === "correct" ? "#16a34a" : status === "wrong" ? "#991b1b" : "#475569";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.cell,
          {
            transform: [{ scale }, { translateX }],
            backgroundColor: bg,
            borderColor: border,
          },
        ]}
      >
        <Animated.Text style={[styles.letter, { opacity: textOpacity }]}>
          {revealed && letter ? letter : ""}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  letter: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
});

export default React.memo(LetterCell);