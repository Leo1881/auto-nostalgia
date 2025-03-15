import { Stack } from "expo-router";

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
