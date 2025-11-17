import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  StyleSheet,
} from "react-native";
import { styles as globalStyles } from "../styles/styles.js";
import { missionsData } from "./data.js";

export default function HomeScreen({ navigation }) {
  return (
    <ImageBackground source={require("../assets/bg.png")} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, alignItems: "center" }}>
        <Text style={styles.titleMain}>Word Guess Game</Text>
        <Text style={styles.subtitle}>Choose a category</Text>

        <View style={styles.categoriesContainer}>
          {missionsData.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.categoryButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Tickets", { category: item })}
            >
              <Text style={styles.categoryText}>{item.category}</Text>
              <Text style={styles.categoryCount}>{item.items.length} levels</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  titleMain: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "#e2e8f0",
    marginBottom: 24,
    textAlign: "center",
  },
  categoriesContainer: {
    width: "100%",
    gap: 12,
  },
  categoryButton: {
    width: "100%",
    backgroundColor: "rgba(12, 54, 131, 0.8)",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "white",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 12,
  },
  categoryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
  },
  categoryCount: {
    color: "#cbd5e1",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
});
