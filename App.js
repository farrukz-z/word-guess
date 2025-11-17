import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator.js";
import { useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import { AppState } from "react-native";

export default function App() {
  const soundRef = useRef(null);
  const intervalRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const [isMuted, setIsMuted] = useState(false);

  // Функция для воспроизведения звука
  const playBackgroundSound = async () => {
    try {
      if (!soundRef.current) return;

      const status = await soundRef.current.getStatusAsync();
      
      if (!status.isLoaded) return;

      // Если звук играет, пропускаем
      if (status.isPlaying) return;

      // Устанавливаем позицию в начало и воспроизводим
      await soundRef.current.setPositionAsync(0);
      await soundRef.current.playAsync();
    } catch (error) {
      console.log("Error playing background sound:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Загрузка и настройка звука
    const setupSound = async () => {
      try {
        // Настройка аудио режима
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const soundAsset = require("./assets/sounds/bg.m4a");
        const { sound } = await Audio.Sound.createAsync(
          soundAsset,
          {
            isLooping: true,
            volume: 0.2,
          }
        );

        if (!mounted) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;

        // Запускаем первое воспроизведение
        await sound.playAsync();

        // Устанавливаем интервал для перезапуска
        // 124 секунды = 124000 мс
        intervalRef.current = setInterval(() => {
          playBackgroundSound();
        }, 124000);

      } catch (error) {
        console.log("Error setting up sound:", error);
      }
    };

    setupSound();

    // Обработка изменения состояния приложения
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // Приложение вернулось на передний план
        if (soundRef.current && !isMuted) {
          playBackgroundSound();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // Приложение ушло в фон
        if (soundRef.current) {
          soundRef.current.pauseAsync().catch(() => {});
        }
      }
      appState.current = nextAppState;
    });

    // Cleanup
    return () => {
      mounted = false;
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      subscription?.remove();

      (async () => {
        try {
          if (soundRef.current) {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }
        } catch (error) {
          console.log("Error cleaning up sound:", error);
        }
      })();
    };
  }, [isMuted]);

  // Функция для управления звуком (можно вызвать из любого места через контекст)
  const toggleMute = async () => {
    try {
      if (!soundRef.current) return;

      if (isMuted) {
        await soundRef.current.setVolumeAsync(0.2);
        await playBackgroundSound();
      } else {
        await soundRef.current.setVolumeAsync(0);
        await soundRef.current.pauseAsync();
      }
      setIsMuted(!isMuted);
    } catch (error) {
      console.log("Error toggling mute:", error);
    }
  };

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}