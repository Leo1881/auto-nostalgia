import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { useState } from "react";
import { register, loginWithGoogle } from "../services/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    setApiError("");

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
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
    setApiError("");

    try {
      const { confirmPassword, ...registrationData } = formData;
      // Combine first and last name for registration
      const fullName = `${registrationData.firstName} ${registrationData.lastName}`;
      const { data, error } = await register({ ...registrationData, fullName });

      if (error) throw error;

      // Show verification message
      setVerificationSent(true);
      Alert.alert(
        "Verification Email Sent",
        "Please check your email to verify your account.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error) {
      setApiError(error.message || "Registration failed. Please try again.");
      Alert.alert(
        "Registration Error",
        error.message || "Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setApiError("");

    try {
      const { data, error } = await loginWithGoogle();
      if (error) throw error;

      // Google OAuth will handle the redirect
      // The user will be redirected back to the app after successful authentication
    } catch (error) {
      setApiError(error.message || "Google signup failed. Please try again.");
      Alert.alert(
        "Google Signup Error",
        error.message || "Please try again later."
      );
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

      {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}
      {verificationSent ? (
        <Text style={styles.successText}>
          Please check your email to verify your account.
        </Text>
      ) : null}

      <Button
        title="Continue with Google"
        onPress={handleGoogleSignup}
        variant="secondary"
        style={styles.button}
        disabled={isLoading}
        icon={require("../assets/google_logo.png")}
      />

      <View style={styles.divider}>
        <Text style={styles.dividerText}>or</Text>
      </View>

      <FormField
        label="First Name"
        placeholder="Enter your first name"
        autoCapitalize="words"
        value={formData.firstName}
        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
        error={errors.firstName}
        editable={!isLoading}
      />

      <FormField
        label="Last Name"
        placeholder="Enter your last name"
        autoCapitalize="words"
        value={formData.lastName}
        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
        error={errors.lastName}
        editable={!isLoading}
      />

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
        placeholder="Create a password"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        error={errors.password}
        editable={!isLoading}
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
        editable={!isLoading}
      />

      <Button
        title={isLoading ? "Creating Account..." : "Create Account"}
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
  errorText: {
    color: "#d90429",
    fontFamily: "Poppins-Regular",
    marginBottom: 16,
  },
  successText: {
    color: "#4CAF50",
    fontFamily: "Poppins-Regular",
    marginBottom: 16,
  },
});
