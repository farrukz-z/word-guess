import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { styles } from "../styles/styles.js";

export default function LetterCell({ letter, onPress }) {
  return (
    <TouchableOpacity style={styles.cell} onPress={onPress}>
      <Text style={styles.cellText}>{letter}</Text>
    </TouchableOpacity>
  );
}
