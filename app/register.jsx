import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";

export default function RegisterScreen() {
  const handleRegister = () => {
    // We'll add registration logic when we implement auth state
    console.log("Register pressed");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
      </View>

      <Button
        title="Continue with Google"
        onPress={() => console.log("Google signup")}
        variant="secondary"
        style={styles.button}
      />

      <View style={styles.divider}>
        <Text style={styles.dividerText}>or</Text>
      </View>

      <FormField
        label="Full Name"
        placeholder="Enter your full name"
        autoCapitalize="words"
      />

      <FormField
        label="Email"
        placeholder="Enter your email"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <FormField
        label="Password"
        placeholder="Create a password"
        secureTextEntry
      />

      <FormField
        label="Confirm Password"
        placeholder="Confirm your password"
        secureTextEntry
      />

      <Button
        title="Create Account"
        onPress={handleRegister}
        style={styles.button}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/login">
          <Text style={styles.link}>Sign In</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
  },
  button: {
    marginTop: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerText: {
    flex: 1,
    textAlign: "center",
    color: "#666666",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#666666",
  },
  link: {
    color: "#0A7EA4",
    fontWeight: "600",
  },
});
