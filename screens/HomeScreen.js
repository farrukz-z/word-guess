import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { styles } from "../styles/styles.js";
import { missionsData } from "./data.js";

export default function HomeScreen({ navigation }) {
  return (
    <ImageBackground source={require("../assets/bg.png")} style={{ flex: 1 }}>
      <View style={[styles.container, { justifyContent: "center" }]}>
        <View
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            width: "100%",
          }}
        >
          {missionsData.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.missionButton, { width: "100%" }]}
              onPress={() => navigation.navigate("Tickets", { category: item })}
            >
              <Text style={styles.missionText}>{item.category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}
