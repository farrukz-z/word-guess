import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator.js";
import { useEffect } from "react";
import { Audio } from "expo-av";

export default function App() {
  const soundAsset = require("./assets/sounds/bg.m4a");
  const playClickSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(soundAsset);
      await sound.setIsLoopingAsync(true);
      await sound.setVolumeAsync(0.2);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  };
  useEffect(() => {
    setInterval(() => {
      playClickSound();
    }, 124000);
      playClickSound();
  }, []);
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
