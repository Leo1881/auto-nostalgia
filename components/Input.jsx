import { TextInput, StyleSheet } from "react-native";

export function Input({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = "none",
  style,
  ...props
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      placeholderTextColor="#666666"
      style={[styles.input, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000000",
  },
});
