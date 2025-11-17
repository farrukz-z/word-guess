// screens/QuestionScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Animated,
  Dimensions,
} from "react-native";
import { styles } from "../styles/styles";
import Keyboard from "../components/Keyboard";
import LetterCell from "../components/LetterCell";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildFixedKeys(word) {
  const base = word.split("");
  const extrasPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter((c) => !base.includes(c));
  const extras = shuffleArray(extrasPool).slice(0, Math.max(0, 12 - base.length));
  const combined = shuffleArray([...base, ...extras]);
  return combined.map((letter, idx) => ({ id: `${letter}-${idx}`, letter }));
}

export default function QuestionScreen({ route, navigation }) {
  const { mission, categoryItems, missionIndex } = route.params || {};
  const word = (mission?.name || "").toUpperCase();
  const missionId = mission?.id;

  const fade = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Звуковые ассеты
  const winAsset = require("../assets/sounds/win.wav");
  const loseAsset = require("../assets/sounds/lose.wav");
  const hintAsset = require("../assets/sounds/click.mp3");
  const pressAsset = require("../assets/sounds/del_sim.wav");

  const winSoundRef = useRef(null);
  const loseSoundRef = useRef(null);
  const hintSoundRef = useRef(null);
  const pressSoundRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { sound: s1 } = await Audio.Sound.createAsync(winAsset);
        const { sound: s2 } = await Audio.Sound.createAsync(loseAsset);
        const { sound: s3 } = await Audio.Sound.createAsync(hintAsset);
        const { sound: s4 } = await Audio.Sound.createAsync(pressAsset);

        if (!mounted) {
          try { await s1.unloadAsync(); } catch {}
          try { await s2.unloadAsync(); } catch {}
          try { await s3.unloadAsync(); } catch {}
          try { await s4.unloadAsync(); } catch {}
          return;
        }

        winSoundRef.current = s1;
        loseSoundRef.current = s2;
        hintSoundRef.current = s3;
        pressSoundRef.current = s4;
      } catch (e) {
        console.log("sound load err", e);
      }
    })();

    return () => {
      mounted = false;
      (async () => {
        try {
          if (winSoundRef.current) await winSoundRef.current.unloadAsync();
          if (loseSoundRef.current) await loseSoundRef.current.unloadAsync();
          if (hintSoundRef.current) await hintSoundRef.current.unloadAsync();
          if (pressSoundRef.current) await pressSoundRef.current.unloadAsync();
        } catch (e) {
          console.log("error unloading sounds", e);
        }
      })();
    };
  }, []);

  const play = async (ref) => {
    try {
      if (!ref?.current) return;
      const st = await ref.current.getStatusAsync();
      if (!st?.isLoaded) return;
      if (st.isPlaying) {
        try { await ref.current.stopAsync(); } catch {}
      }
      await ref.current.replayAsync();
    } catch (e) {
      console.log("play sound err", e);
    }
  };

  const playPress = async () => {
    try {
      if (!pressSoundRef.current) return;
      const st = await pressSoundRef.current.getStatusAsync();
      if (!st?.isLoaded) return;
      if (st.isPlaying) {
        try { await pressSoundRef.current.stopAsync(); } catch {}
      }
      await pressSoundRef.current.replayAsync();
    } catch (e) {
      console.log("playPress err", e);
    }
  };

  const [keys] = useState(() => buildFixedKeys(word));
  const [usedKeyIndexes, setUsedKeyIndexes] = useState([]);
  const [guessesLetters, setGuessesLetters] = useState(Array(word.length).fill(""));
  const [guessesKeyIndex, setGuessesKeyIndex] = useState(Array(word.length).fill(null));
  const [status, setStatus] = useState(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [draggingLetter, setDraggingLetter] = useState(null);

  const animateTransition = async (onMid = () => {}) => {
    await new Promise((res) => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -8, duration: 160, useNativeDriver: true }),
      ]).start(() => res());
    });
    onMid();
    await new Promise((res) => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(() => res());
    });
  };

  const handlePressKey = (keyIndex) => {
    if (status) return;
    if (usedKeyIndexes.includes(keyIndex)) return;

    const emptyIndex = guessesLetters.findIndex((g) => g === "");
    if (emptyIndex === -1) return;

    const letter = keys[keyIndex].letter;

    setGuessesLetters((prev) => {
      const copy = [...prev];
      copy[emptyIndex] = letter;
      return copy;
    });
    setGuessesKeyIndex((prev) => {
      const copy = [...prev];
      copy[emptyIndex] = keyIndex;
      return copy;
    });
    setUsedKeyIndexes((prev) => [...prev, keyIndex]);
  };

  const handleDragStart = (letter, keyIndex) => {
    setDraggingLetter({ letter, keyIndex });
  };

  const handleDragEnd = () => {
    setDraggingLetter(null);
  };

  const handleCellPress = (slotIndex) => {
    if (status) return;
    if (draggingLetter) {
      const keyIdx = draggingLetter.keyIndex;
      if (usedKeyIndexes.includes(keyIdx)) {
        handleDragEnd();
        return;
      }
      const oldKeyIdx = guessesKeyIndex[slotIndex];
      if (oldKeyIdx !== null) setUsedKeyIndexes((prev) => prev.filter((i) => i !== oldKeyIdx));

      setGuessesLetters((prev) => {
        const copy = [...prev];
        copy[slotIndex] = draggingLetter.letter;
        return copy;
      });
      setGuessesKeyIndex((prev) => {
        const copy = [...prev];
        copy[slotIndex] = keyIdx;
        return copy;
      });
      setUsedKeyIndexes((prev) => [...prev, keyIdx]);
      handleDragEnd();
      return;
    }

    const keyIdx = guessesKeyIndex[slotIndex];
    if (keyIdx == null) return;
    playPress().catch(() => {});

    setUsedKeyIndexes((prev) => prev.filter((i) => i !== keyIdx));
    setGuessesLetters((prev) => {
      const copy = [...prev];
      copy[slotIndex] = "";
      return copy;
    });
    setGuessesKeyIndex((prev) => {
      const copy = [...prev];
      copy[slotIndex] = null;
      return copy;
    });
  };

  const handleHint = () => {
    if (hintUsed || status) return;
    const emptySlots = guessesLetters.map((g, i) => (g === "" ? i : -1)).filter((i) => i !== -1);
    if (emptySlots.length === 0) return;
    const slot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
    const correctLetter = word[slot];
    const availableKeyIndex = keys.findIndex(
      (k, idx) => k.letter === correctLetter && !usedKeyIndexes.includes(idx)
    );

    if (availableKeyIndex === -1) {
      setGuessesLetters((prev) => { const copy = [...prev]; copy[slot] = correctLetter; return copy; });
      setGuessesKeyIndex((prev) => { const copy = [...prev]; copy[slot] = null; return copy; });
    } else {
      setGuessesLetters((prev) => { const copy = [...prev]; copy[slot] = correctLetter; return copy; });
      setGuessesKeyIndex((prev) => { const copy = [...prev]; copy[slot] = availableKeyIndex; return copy; });
      setUsedKeyIndexes((prev) => [...prev, availableKeyIndex]);
    }

    setHintUsed(true);
    play(hintSoundRef);
  };

  useEffect(() => {
    if (guessesLetters.every((l) => l !== "")) {
      const candidate = guessesLetters.join("");
      const correct = candidate === word;
      setStatus(correct ? "correct" : "wrong");

      if (correct) {
        play(winSoundRef);

        const saveAndNavigate = async () => {
          try {
            const stored = await AsyncStorage.getItem("completedWords");
            const completed = stored ? JSON.parse(stored) : [];
            const idToSave = missionId != null ? String(missionId) : null;
            if (idToSave && !completed.includes(idToSave)) {
              const newCompleted = [...completed, idToSave];
              await AsyncStorage.setItem("completedWords", JSON.stringify(newCompleted));
            }

            const nextMissionIndex = missionIndex + 1;
            setTimeout(() => {
              if (categoryItems && nextMissionIndex < categoryItems.length) {
                const nextMission = categoryItems[nextMissionIndex];
                navigation.replace("Question", { mission: nextMission, categoryItems, missionIndex: nextMissionIndex });
              } else {
                Alert.alert("Победа!", "Вы прошли всю категорию!", [{ text: "OK", onPress: () => navigation.goBack() }]);
              }
            }, 700);
          } catch {
            setTimeout(() => navigation.goBack(), 700);
          }
        };

        if (missionId) saveAndNavigate();
        else setTimeout(() => navigation.goBack(), 700);
      } else {
        play(loseSoundRef);
        setTimeout(() => {
          Alert.alert(
            "Неверно",
            "Выбранный ответ неверен",
            [
              { text: "Заново", onPress: () => handleRetry() },
              { text: "Назад", onPress: () => navigation.goBack(), style: "cancel" },
            ],
            { cancelable: false }
          );
          resetRound();
        }, 200);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guessesLetters]);

  const resetRound = () => {
    setGuessesLetters(Array(word.length).fill(""));
    setGuessesKeyIndex(Array(word.length).fill(null));
    setUsedKeyIndexes([]);
    setStatus(null);
    setHintUsed(false);
    setDraggingLetter(null);
  };

  const handleRetry = () => animateTransition(resetRound);

  return (
    <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY }] }}>
      <ImageBackground source={require("../assets/bg.png")} style={{ flex: 1 }}>
        <View style={[styles.container, { paddingTop: 32 }]}>
          <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
              <View style={{ padding: 8, backgroundColor: "#e2e8f0", borderRadius: 8 }}>
                <Text style={{ fontWeight: "600" }}>← Back</Text>
              </View>
            </TouchableOpacity>
            <Text style={[styles.title, { marginTop: 16, color: "#fff" }]}>Mission: {mission?.id || "?"}</Text>
            <TouchableOpacity onPress={handleHint} disabled={!!(hintUsed || status)}>
              <View style={{ padding: 8, backgroundColor: hintUsed ? "#64748b" : "#f59e0b", borderRadius: 8 }}>
                <Text style={{ color: hintUsed ? "#cbd5e1" : "#000", fontWeight: "600" }}>
                  {hintUsed ? "💡 Used" : "💡 Hint"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {mission?.image && (
            <Image source={mission.image} style={[styles.missionImage, { width: 220, height: 140 }]} resizeMode="contain" />
          )}

          <View style={{ width: "90%", height: 8, backgroundColor: "#334155", borderRadius: 6, overflow: "hidden", marginTop: 12 }}>
            <View
              style={{
                width: `${(guessesLetters.filter((g) => g !== "").length / (word.length || 1)) * 100}%`,
                height: "100%",
                backgroundColor: "#22c55e",
              }}
            />
          </View>

          <View style={[styles.grid, { marginTop: 18 }]}>
            {guessesLetters.map((l, index) => (
              <LetterCell
                key={`${index}-${l}`}
                letter={l}
                revealed={l !== ""}
                status={status === "correct" ? "correct" : status === "wrong" ? "wrong" : "neutral"}
                onPress={() => handleCellPress(index)}
              />
            ))}
          </View>

          <Keyboard
            keys={keys}
            usedKeyIndexes={usedKeyIndexes}
            onPressKey={handlePressKey}
            draggingLetter={draggingLetter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />

          <View style={{ alignItems: "center", marginTop: 8 }}>
            <TouchableOpacity onPress={handleRetry} style={{ backgroundColor: "#3b82f6", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}
