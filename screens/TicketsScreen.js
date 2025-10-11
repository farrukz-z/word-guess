// screens/TicketsScreen.js

import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from "react-native";
import { styles } from "../styles/styles.js"; // Убедитесь, что стили импортированы корректно

export default function TicketsScreen({ route, navigation }) {
  const { category } = route.params;
  const [completed, setCompleted] = useState([]);

  const loadCompleted = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("completedWords");
      const data = stored ? JSON.parse(stored) : [];
      setCompleted(data);
    } catch (error) {
        console.error("Error loading completed words:", error);
    }
  }, []); 

  useEffect(() => {
    loadCompleted();
    const unsubscribe = navigation.addListener("focus", loadCompleted);
    return unsubscribe;
  }, [navigation, loadCompleted]);
  

  const isLocked = (index) => {
    if (index === 0) return false;
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
                  // 💡 ИЗМЕНЕНИЕ: Передаем весь массив и текущий индекс
                  !locked && navigation.navigate("Question", { 
                    mission: item,
                    categoryItems: category.items, // Полный список миссий
                    missionIndex: i, // Индекс текущей миссии
                  })
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