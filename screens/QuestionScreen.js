import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from "react-native";
import { styles } from "../styles/styles";
import Keyboard from "../components/Keyboard";
import LetterCell from "../components/LetterCell";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function QuestionScreen({ route, navigation }) {
  const { mission } = route.params;
  const word = mission.name.toUpperCase();

  const win = require("../assets/sounds/win.wav");
  const lose = require("../assets/sounds/lose.wav");
  const playSound = async (soundAsset) => {
    try {
      const { sound } = await Audio.Sound.createAsync(soundAsset);
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  };
  const [guesses, setGuesses] = useState(Array(word.length).fill(""));
  const [keyboard, setKeyboard] = useState(shuffleArray(word.split("")));
  const [status, setStatus] = useState(null);

  const handlePress = (letter) => {
    if (status) return;
    const emptyIndex = guesses.findIndex((l) => l === "");
    if (emptyIndex === -1) return;

    const newGuesses = [...guesses];
    newGuesses[emptyIndex] = letter;
    setGuesses(newGuesses);
    setKeyboard(keyboard.filter((l, i) => i !== keyboard.indexOf(letter)));
  };

  const handleCellPress = (index) => {
    if (status) return;
    const letter = guesses[index];
    if (!letter) return;
    const newGuesses = [...guesses];
    newGuesses[index] = "";
    setGuesses(newGuesses);
    setKeyboard([...keyboard, letter]);
  };

  useEffect(() => {
    if (guesses.every((l) => l !== "")) {
      const isCorrect = guesses.join("") === word;
      setStatus(isCorrect ? "correct" : "wrong");

      if (isCorrect) {
        playSound(win);
        const saveWord = async () => {
          try {
            const stored = await AsyncStorage.getItem("completedWords");
            const completed = stored ? JSON.parse(stored) : [];
            if (!completed.includes(mission.id)) {
              completed.push(mission.id);
              await AsyncStorage.setItem(
                "completedWords",
                JSON.stringify(completed)
              );
            }
          } catch (e) {
            console.log("Error saving word:", e);
          }
        };
        saveWord();
        Alert.alert(
          "✅ Congratulations!",
          "You got the word right!",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ],
          { cancelable: false }
        );
      } else {
        playSound(lose);
        Alert.alert("❌ Error!", "Please try again.");
      }
    }
  }, [guesses]);

  const handleRetry = () => {
    setGuesses(Array(word.length).fill(""));
    setKeyboard(shuffleArray(word.split("")));
    setStatus(null);
  };

  return (
    <ImageBackground source={require("../assets/bg.png")} style={{ flex: 1 }}>
      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            backgroundColor:
              status === "correct"
                ? "#0a892a99" // yashil fon
                : status === "wrong"
                ? "#b91c1c99" // qizil fon
                : "#00000096", // odatiy fon
          },
        ]}
      >
        <Text style={styles.title}>Mission: {mission.id}</Text>
        <Image source={mission.image} style={styles.missionImage} />

        <View style={styles.grid}>
          {guesses.map((l, index) => (
            <LetterCell
              key={index}
              letter={l}
              onPress={() => handleCellPress(index)}
            />
          ))}
        </View>

        <Keyboard letters={keyboard} onPress={handlePress} />

        {status === "wrong" && (
          <TouchableOpacity
            onPress={handleRetry}
            style={{
              marginTop: 20,
              backgroundColor: "#2563eb",
              paddingVertical: 12,
              paddingHorizontal: 30,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
              🔄 Retry
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  );
}
