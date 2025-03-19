import { View, Text, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Button } from "../components/Button";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

export default function DashboardScreen() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    console.log("Dashboard mounted");
    const getUser = async () => {
      try {
        console.log("Getting user data...");
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error getting user:", error);
          throw error;
        }

        console.log("User data:", user);
        if (user) {
          setUserEmail(user.email);
        } else {
          console.log("No user found, redirecting to login");
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error in getUser:", error);
        router.replace("/login");
      }
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Dashboard",
          headerBackTitle: "Back",
        }}
      />
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Welcome to Auto Nostalgia!</Text>
        <Text style={styles.emailText}>{userEmail}</Text>

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          style={styles.signOutButton}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#000000",
    marginBottom: 8,
    textAlign: "center",
  },
  emailText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#666666",
    marginBottom: 32,
  },
  signOutButton: {
    marginTop: 16,
  },
});
