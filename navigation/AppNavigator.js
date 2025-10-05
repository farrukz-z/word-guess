import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import TicketsScreen from "../screens/TicketsScreen";
import QuestionScreen from "../screens/QuestionScreen";
import { ImageBackground } from "react-native";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <ImageBackground source={require("../assets/bg.png")} style={{ flex: 1 }}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Tickets" component={TicketsScreen} />
        <Stack.Screen name="Question" component={QuestionScreen} />
      </Stack.Navigator>
    </ImageBackground>
  );
}
