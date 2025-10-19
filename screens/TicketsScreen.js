// screens/TicketsScreen.js
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "../styles/styles.js"; // убедитесь, что путь верен

export default function TicketsScreen({ route, navigation }) {
  const { category } = route.params || {};
  const [completed, setCompleted] = useState([]);

  // Загрузка и приведение к строкам
  const loadCompleted = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("completedWords");
      const data = stored ? JSON.parse(stored) : [];
      // приводим все сохранённые id к строкам, фильтруем некорректные значения
      const normalized = Array.isArray(data) ? data.map((x) => String(x)) : [];
      setCompleted(normalized);
    } catch (error) {
      console.error("Error loading completedWords:", error);
      setCompleted([]);
    }
  }, []);

  useEffect(() => {
    loadCompleted();
    const unsubscribe = navigation.addListener("focus", loadCompleted);
    return unsubscribe;
  }, [navigation, loadCompleted]);

  const isLocked = (index) => {
    // первая миссия всегда доступна
    if (index === 0) return false;

    // безопасно получаем предыдущий элемент
    const prev = category?.items?.[index - 1];
    if (!prev || prev.id === undefined || prev.id === null) return true;

    return !completed.includes(String(prev.id));
  };

  // Отметка решённых миссий
  const isSolved = (item) => {
    if (!item || item.id === undefined || item.id === null) return false;
    return completed.includes(String(item.id));
  };

  // Защита: если category или category.items не определены — показываем заглушку
  if (!category || !Array.isArray(category.items)) {
    return (
      <ImageBackground source={require("../assets/bg.png")} style={{ flex: 1 }}>
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <Text style={styles.title}>Нет доступных миссий</Text>
          <Text style={{ color: "#fff", marginTop: 8 }}>Проверьте данные категории.</Text>
        </View>
      </ImageBackground>
    );
  }

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
            const solved = isSolved(item);

            return (
              <TouchableOpacity
                key={item.id ?? i}
                style={[
                  styles.missionButton,
                  {
                    width: "30%",
                    backgroundColor: solved ? "#22c55e" : locked ? "#6e6e6eff" : "#2563eb",
                  },
                ]}
                disabled={locked}
                onPress={() =>
                  !locked &&
                  navigation.navigate("Question", {
                    mission: item,
                    categoryItems: category.items,
                    missionIndex: i,
                  })
                }
              >
                <Text style={styles.missionText}>{i + 1}</Text>
                <Text style={[styles.missionText, { fontSize: 13, marginTop: 4 }]}>
                  {solved ? "⭐⭐⭐" : locked ? "🔐" : ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ImageBackground>
  );
}
