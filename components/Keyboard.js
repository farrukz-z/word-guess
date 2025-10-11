// components/Keyboard.js
import React, { useRef, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Animated, PanResponder } from "react-native";

const { width, height } = Dimensions.get("window");

// Keyboard receives:
// - keys: [{ id, letter }, ...]  (fixed array)
// - usedKeyIndexes: array of indices that are used (e.g. [0,3,7])
// - onPressKey: function(keyIndex) => void
// - draggingLetter: { letter, keyIndex } or null
// - onDragStart: function(letter, keyIndex) => void
// - onDragEnd: function() => void
export default function Keyboard({
  keys = [],
  usedKeyIndexes = [],
  onPressKey = () => {},
  draggingLetter = null,
  onDragStart = () => {},
  onDragEnd = () => {},
}) {
  // Расположение букв по кругу
  const getLettersAroundCircle = () => {
    const count = keys.length;
    if (count === 0) return [];

    const radius = 100;
    return keys.map((k, idx) => {
      const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      return { ...k, x, y, idx };
    });
  };

  const circleLetters = getLettersAroundCircle();
  const centerX = width / 2.3;
  const centerY = height * 0.16; // центр круга примерно в середине экрана

  return (
    <View style={styles.container}>
      {/* Дальний фон круга */}
      <View
        style={[
          styles.circleBackground,
          {
            left: centerX - 120,
            top: centerY - 120,
          },
        ]}
      />

      {/* Буквы по кругу */}
      {circleLetters.map((item) => {
        const isUsed = usedKeyIndexes.includes(item.idx);
        const isDragging = draggingLetter?.keyIndex === item.idx;

        return (
          <Animated.View
            key={`${item.id}-${item.idx}`}
            style={[
              styles.letterCircleWrapper,
              {
                left: centerX + item.x - 22,
                top: centerY + item.y - 22,
                opacity: isUsed ? 0.4 : 1,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onLongPress={() => {
                if (!isUsed) {
                  onDragStart(item.letter, item.idx);
                }
              }}
              onPress={() => {
                if (!isUsed && !draggingLetter) {
                  onPressKey(item.idx);
                }
              }}
              disabled={isUsed}
              style={[
                styles.letterCircle,
                {
                  backgroundColor: isUsed ? "#64748b" : isDragging ? "#0ea5e9" : "#3b82f6",
                  borderColor: isDragging ? "#06b6d4" : "#1e40af",
                },
              ]}
            >
              <Text
                style={[
                  styles.letterCircleText,
                  { color: isUsed ? "#94a3b8" : "#fff" },
                ]}
              >
                {item.letter}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    height: 280,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  circleBackground: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(30, 41, 59, 0.3)",
    borderWidth: 2,
    borderColor: "rgba(71, 85, 105, 0.4)",
    borderStyle: "dashed",
  },
  letterCircleWrapper: {
    position: "absolute",
    width: 44,
    height: 44,
  },
  letterCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  letterCircleText: {
    fontSize: 20,
    fontWeight: "700",
  },
});
