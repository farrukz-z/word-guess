import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { styles } from "../styles/styles.js";

export default function TicketsScreen({ route, navigation }) {
  const { category } = route.params;
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    const loadCompleted = async () => {
      const stored = await AsyncStorage.getItem("completedWords");
      setCompleted(stored ? JSON.parse(stored) : []);
    };
    const unsubscribe = navigation.addListener("focus", loadCompleted);
    return unsubscribe;
  }, [navigation]);

  const isLocked = (index) => {
    // 1-chi topshiriq har doim ochiq
    if (index === 0) return false;
    // Avvalgisini topmagan bo'lsa — qulflanadi
    return !completed.includes(category.items[index - 1].id);
  };

  return (
    <ImageBackground source={require("../assets/bg.png")} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>{category.category}</Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
          }}
        >
          {category.items.map((item, i) => {
            const locked = isLocked(i);
            const solved = completed.includes(item.id);

            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.missionButton,
                  {
                    width: "30%",
                    backgroundColor: solved ? "#22c55e" : locked ? '#6e6e6eff' : "#2563eb",
                  },
                ]}
                disabled={locked}
                onPress={() =>
                  !locked && navigation.navigate("Question", { mission: item })
                }
              >
                <Text style={styles.missionText}>
                  {i + 1}
                </Text>
                {<Text style={[styles.missionText, {fontSize: 13, marginTop: 4}]}>
                  {solved ? "⭐⭐⭐" : locked ? "🔐" : ''}
                </Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ImageBackground>
  );
}
