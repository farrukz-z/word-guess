import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Audio } from "expo-av"; // ✅ Import audio
import { styles } from "../styles/styles.js";

export default function Keyboard({ letters, onPress }) {
  const soundAsset = require("../assets/sounds/click.mp3");
  const playClickSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(soundAsset);
      await sound.playAsync();

      // Optional: unload after playing to free memory
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  };

  return (
    <View style={styles.keyboard}>
      {letters.map((letter, index) => (
        <TouchableOpacity
          key={letter + index}
          style={styles.key}
          onPress={() => {
            playClickSound(); // ✅ Play sound
            onPress(letter); // ✅ Call parent handler
          }}
        >
          <Text style={styles.keyText}>{letter}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
