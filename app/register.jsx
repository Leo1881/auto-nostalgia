import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { useState } from "react";

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // TODO: Implement actual registration logic here
      // For now, we'll just simulate a successful registration
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.replace("/");
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Google signup
      console.log("Google signup pressed");
    } catch (error) {
      console.error("Google signup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
      </View>

      <Button
        title="Continue with Google"
        onPress={handleGoogleSignup}
        variant="secondary"
        style={styles.button}
        disabled={isLoading}
      />

      <View style={styles.divider}>
        <Text style={styles.dividerText}>or</Text>
      </View>

      <FormField
        label="Full Name"
        placeholder="Enter your full name"
        autoCapitalize="words"
        value={formData.fullName}
        onChangeText={(text) => setFormData({ ...formData, fullName: text })}
        error={errors.fullName}
      />

      <FormField
        label="Email"
        placeholder="Enter your email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        error={errors.email}
      />

      <FormField
        label="Password"
        placeholder="Create a password"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        error={errors.password}
      />

      <FormField
        label="Confirm Password"
        placeholder="Confirm your password"
        secureTextEntry
        value={formData.confirmPassword}
        onChangeText={(text) =>
          setFormData({ ...formData, confirmPassword: text })
        }
        error={errors.confirmPassword}
      />

      <Button
        title="Create Account"
        onPress={handleRegister}
        style={styles.button}
        disabled={isLoading}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/login">
          <Text style={styles.link}>Sign In</Text>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#000000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
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
    fontFamily: "Poppins-Regular",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  footerText: {
    color: "#666666",
    fontFamily: "Poppins-Regular",
  },
  link: {
    color: "#d90429",
    fontFamily: "Poppins-SemiBold",
  },
});
