import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { Link, useRouter, Stack } from "expo-router";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validateForm = () => {
    const newErrors = {};
    setApiError("");

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Successful login
      router.replace("/");
    } catch (error) {
      setApiError(error.message || "Login failed. Please try again.");
      Alert.alert("Login Error", error.message || "Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setApiError("");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      if (error) throw error;

      // Google OAuth will handle the redirect
      // The user will be redirected back to the app after successful authentication
    } catch (error) {
      setApiError(error.message || "Google login failed. Please try again.");
      Alert.alert(
        "Google Login Error",
        error.message || "Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      setErrors({ email: "Please enter your email address" });
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.email,
        {
          redirectTo: "auto-nostalgia://reset-password",
        }
      );

      if (error) throw error;

      Alert.alert(
        "Password Reset Email Sent",
        "Please check your email for password reset instructions.",
        [{ text: "OK" }]
      );
    } catch (error) {
      setApiError(error.message || "Password reset failed. Please try again.");
      Alert.alert(
        "Password Reset Error",
        error.message || "Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Sign In",
          headerBackTitle: "Back",
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}

        <Button
          title="Continue with Google"
          onPress={handleGoogleLogin}
          variant="secondary"
          style={styles.button}
          disabled={isLoading}
          icon={require("../assets/google_logo.png")}
        />

        <View style={styles.divider}>
          <Text style={styles.dividerText}>or</Text>
        </View>

        <FormField
          label="Email"
          placeholder="Enter your email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          error={errors.email}
          editable={!isLoading}
        />

        <FormField
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          error={errors.password}
          editable={!isLoading}
        />

        <Button
          title="Forgot Password?"
          onPress={handleForgotPassword}
          variant="text"
          style={styles.forgotPasswordButton}
          disabled={isLoading}
        />

        <Button
          title={isLoading ? "Signing In..." : "Sign In"}
          onPress={handleLogin}
          style={styles.button}
          disabled={isLoading}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/register">
            <Text style={styles.link}>Sign Up</Text>
          </Link>
        </View>
      </ScrollView>
    </>
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
  forgotPasswordButton: {
    marginTop: 8,
    marginBottom: 16,
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
  errorText: {
    color: "#d90429",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginBottom: 16,
  },
});
