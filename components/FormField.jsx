import { View, Text, StyleSheet } from "react-native";
import { Input } from "./Input";

export function FormField({ label, error, ...inputProps }) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Input {...inputProps} />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
  },
  error: {
    fontSize: 12,
    color: "#FF0000",
    marginTop: 4,
  },
});
