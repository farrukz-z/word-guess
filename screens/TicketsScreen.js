// screens/TicketsScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  FlatList,
  Dimensions,
  StatusBar,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles as globalStyles } from "../styles/styles.js"; // если хочешь использовать свои глобальные стили

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 3;
const ITEM_MARGIN = 8;

// Паддинги контейнера — уменьшенный левый паддинг для "сдвига влево"
const PADDING_LEFT = 10;
const PADDING_RIGHT = 30;
const CONTAINER_HORIZONTAL_PADDING = PADDING_LEFT + PADDING_RIGHT;

// Вычисляем ширину элемента сетки
const totalGaps = ITEM_MARGIN * 2 * NUM_COLUMNS;
const availableWidth = width - CONTAINER_HORIZONTAL_PADDING - totalGaps;
const ITEM_WIDTH = Math.floor(availableWidth / NUM_COLUMNS);

export default function TicketsScreen({ route, navigation }) {
  const { category } = route.params || {};
  const [completed, setCompleted] = useState([]);

  const loadCompleted = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("completedWords");
      const data = stored ? JSON.parse(stored) : [];
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
    if (index === 0) return false;
    const prev = category?.items?.[index - 1];
    if (!prev || prev.id === undefined || prev.id === null) return true;
    return !completed.includes(String(prev.id));
  };

  const isSolved = (item) => {
    if (!item || item.id === undefined || item.id === null) return false;
    return completed.includes(String(item.id));
  };

  // Защита: если category или category.items не определены — показываем заглушку
  if (!category || !Array.isArray(category.items)) {
    return (
      <ImageBackground source={require("../assets/bg.png")} style={{ flex: 1 }}>
        <SafeAreaView style={[styles.centerFallback]}>
          <Text style={[globalStyles?.title || styles.title]}>Нет доступных миссий</Text>
          <Text style={{ color: "#fff", marginTop: 8 }}>Проверьте данные категории.</Text>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  const renderItem = ({ item, index }) => {
    const locked = isLocked(index);
    const solved = isSolved(item);

    return (
      <View style={{ width: ITEM_WIDTH, margin: ITEM_MARGIN }}>
        <TouchableOpacity
          key={item.id ?? index}
          style={[
            globalStyles?.missionButton,
            styles.card,
            {
              backgroundColor: solved ? "#22c55e" : locked ? "#6e6e6eff" : "#2563eb",
            },
          ]}
          disabled={locked}
          onPress={() =>
            !locked &&
            navigation.navigate("Question", {
              mission: item,
              categoryItems: category.items,
              missionIndex: index,
            })
          }
        >
          <Text style={globalStyles?.missionText || styles.cardText}>{index + 1}</Text>
          <Text style={[globalStyles?.missionText || styles.cardText, { fontSize: 13, marginTop: 6 }]}>
            {solved ? "⭐⭐⭐" : locked ? "🔐" : ""}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ImageBackground source={require("../assets/bg.png")} style={{ flex: 1 }}>
      <SafeAreaView style={[globalStyles?.container || styles.container, { paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 20 }]}>
        <Text style={globalStyles?.title || styles.title}>{category.category}</Text>

        <FlatList
          data={category.items}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          renderItem={renderItem}
          numColumns={NUM_COLUMNS}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: PADDING_LEFT, // уменьшаем левый отступ чтобы "сдвинуть влево"
            paddingRight: PADDING_RIGHT,
            paddingBottom: 32, // чтобы последний элемент не прятался под панелью
            paddingTop: 8,
            alignItems: "flex-start", // важно для корректного выравнивания при фиксированной ширине элементов
          }}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0, // горизонтальные паддинги задаются в contentContainerStyle FlatList
    alignItems: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 14,
    marginLeft: PADDING_LEFT,
    color: "#fff",
  },
  centerFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    paddingVertical: 18,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
    elevation: 3,
  },
  cardText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
