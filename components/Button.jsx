import { Stack } from "expo-router";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  Image,
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
  disabled = false,
  icon,
}) {
  return (
    <Pressable
      style={[
        styles.button,
        variant === "secondary" && styles.secondaryButton,
        variant === "text" && styles.textButton,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && <Image source={icon} style={styles.icon} />}
      <Text
        style={[
          styles.text,
          variant === "secondary" && styles.secondaryText,
          variant === "text" && styles.textButtonText,
          disabled && styles.disabledText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
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
    flexDirection: "row",
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  textButton: {
    backgroundColor: "transparent",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  secondaryText: {
    color: "#000000",
  },
  textButtonText: {
    color: "#d90429",
  },
  disabledText: {
    opacity: 0.6,
  },
  icon: {
    width: 20,
    height: 20,
  },
});
