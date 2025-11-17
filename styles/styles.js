import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginVertical: 20, color: "white" },

  // Category
  categoryButton: {
    flex: 1,
    marginVertical: 8,
    minHeight: 100,
    backgroundColor: "#2196f3",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  categoryText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  missionButton: {
    backgroundColor: "#0c3683c2",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 10,
  },
  missionText: { color: "#fff", fontWeight: "bold", fontSize: 18 },

  // Grid
  grid: { flexDirection: "row", marginBottom: 20, flexWrap: "wrap", justifyContent: "center" },
  cell: {
    borderWidth: 1.5,
    borderColor: "#333",
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
    marginVertical: 2,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  cellText: { fontSize: 18, fontWeight: "bold" },

  // Keyboard
  keyboard: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginBottom: 20 },
  key: { width: 40, height: 40, marginHorizontal: 3, marginVertical: 3, backgroundColor: "#ddd", justifyContent: "center", alignItems: "center", borderRadius: 5 },
  keyText: { fontWeight: "bold" },
  submit: { backgroundColor: "#2196f3", paddingVertical: 10, paddingHorizontal: 30, borderRadius: 5 },

  // Images
  missionImage: { width: "80%", height: 200, marginVertical: 20, borderWidth: 4, borderColor: "white", borderRadius: 12, elevation: 4 },
});
