import { Stack } from "expo-router";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Pressable,
} from "react-native";

export default function RootLayout() {
  // We'll add auth state management here later
  return (
    <Stack>
      {/* Public screens */}
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          // Prevent going back to login if authenticated
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Create Account",
          // Allow back gesture to login
          presentation: "modal",
        }}
      />

      {/* Protected screens */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export function Button({
  title,
  onPress,
  variant = "primary",
  style,
  disabled,
}) {
  const Component = Platform.OS === "web" ? Pressable : TouchableOpacity;

  return (
    <Component
      style={[
        styles.button,
        variant === "secondary" && styles.secondaryButton,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.text,
          variant === "secondary" && styles.secondaryText,
          disabled && styles.disabledText,
        ]}
      >
        {title}
      </Text>
    </Component>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#d90429",
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#d90429",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    borderColor: "#cccccc",
  },
  text: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  secondaryText: {
    color: "#d90429",
  },
  disabledText: {
    color: "#ffffff",
  },
});
