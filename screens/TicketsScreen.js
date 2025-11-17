import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  FlatList,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Константы для адаптивной сетки
const ITEM_MARGIN = 8;
const PADDING_HORIZONTAL = 20;
const MIN_ITEM_WIDTH = 100;

export default function TicketsScreen({ route, navigation }) {
  const { category } = route.params || {};
  const [completed, setCompleted] = useState([]);
  const { width } = useWindowDimensions();

  // Адаптивное количество колонок в зависимости от ширины экрана
  const numColumns = useMemo(() => {
    const availableWidth = width - PADDING_HORIZONTAL * 2;
    const columns = Math.floor(availableWidth / (MIN_ITEM_WIDTH + ITEM_MARGIN * 2));
    return Math.max(2, Math.min(columns, 5)); // От 2 до 5 колонок
  }, [width]);

  // Вычисляем ширину элемента
  const itemWidth = useMemo(() => {
    const totalMargin = ITEM_MARGIN * 2 * numColumns;
    const availableWidth = width - PADDING_HORIZONTAL * 2 - totalMargin;
    return Math.floor(availableWidth / numColumns);
  }, [width, numColumns]);

  const loadCompleted = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("completedWords");
      if (!stored) {
        setCompleted([]);
        return;
      }

      const data = JSON.parse(stored);
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

  const isLocked = useCallback(
    (index) => {
      if (index === 0) return false;
      const prev = category?.items?.[index - 1];
      if (!prev || prev.id === undefined || prev.id === null) return true;
      return !completed.includes(String(prev.id));
    },
    [category, completed]
  );

  const isSolved = useCallback(
    (item) => {
      if (!item || item.id === undefined || item.id === null) return false;
      return completed.includes(String(item.id));
    },
    [completed]
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      const locked = isLocked(index);
      const solved = isSolved(item);

      return (
        <View style={{ width: itemWidth, margin: ITEM_MARGIN }}>
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: solved
                  ? "#22c55e"
                  : locked
                  ? "#64748b"
                  : "#2563eb",
                opacity: locked ? 0.6 : 1,
              },
            ]}
            disabled={locked}
            activeOpacity={0.7}
            onPress={() =>
              !locked &&
              navigation.navigate("Question", {
                mission: item,
                categoryItems: category.items,
                missionIndex: index,
              })
            }
          >
            <Text style={styles.cardNumber}>{index + 1}</Text>
            <Text style={styles.cardIcon}>{solved ? "⭐" : locked ? "🔒" : "🎯"}</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [itemWidth, isLocked, isSolved, navigation, category]
  );

  const keyExtractor = useCallback(
    (item, idx) => String(item?.id ?? `item-${idx}`),
    []
  );

  if (!category || !Array.isArray(category.items)) {
    return (
      <ImageBackground
        source={require("../assets/bg.png")}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.centerFallback}>
          <Text style={styles.title}>Нет доступных миссий</Text>
          <Text style={styles.fallbackText}>Проверьте данные категории.</Text>

          <TouchableOpacity
            style={[styles.backButton, { marginTop: 18 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require("../assets/bg.png")} style={{ flex: 1 }}>
      <SafeAreaView
        style={[
          styles.container,
          { paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 20 },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{category.category}</Text>

          {/* Пустой view для балансировки хедера */}
          <View style={{ width: 72 }} />
        </View>

        <FlatList
          data={category.items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={numColumns}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: PADDING_HORIZONTAL,
            paddingBottom: 32,
            paddingTop: 12,
            alignItems: "flex-start",
          }}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  centerFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  fallbackText: {
    color: "#fff",
    marginTop: 8,
    fontSize: 16,
  },
  backButton: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  backButtonText: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 16,
  },
  card: {
    width: "100%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardNumber: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 22,
  },
  cardIcon: {
    fontSize: 24,
    marginTop: 8,
  },
});
