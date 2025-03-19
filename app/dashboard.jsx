import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/Button";

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setUserEmail(user.email);
        // Extract first name from full name
        const nameParts = user.user_metadata.full_name?.split(" ") || [];
        setFirstName(nameParts[0] || "User");
      } else {
        router.replace("/login");
      }
    } catch (error) {
      console.error("Error checking user:", error);
      router.replace("/login");
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `${firstName}'s Dashboard`,
          headerLeft: () => (
            <TouchableOpacity style={styles.headerLeft}>
              <Ionicons name="menu" size={32} color="#FF3B30" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.headerRight}>
              <Ionicons name="person-circle" size={32} color="#FF3B30" />
            </TouchableOpacity>
          ),
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
    padding: 24,
    backgroundColor: "#FFFFFF",
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
  headerLeft: {
    marginLeft: 16,
  },
  headerRight: {
    marginRight: 16,
  },
});
