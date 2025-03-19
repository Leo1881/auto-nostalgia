import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Player } from "@lottiefiles/react-lottie-player";

export default function HomeScreen() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for display time
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setShowSplash(false);
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Player
          autoplay
          loop={false}
          src={require("../assets/splash.json")}
          style={styles.lottieAnimation}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>Your classic car companion</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, styles.signInButton]}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.registerButton]}
          onPress={() => router.push("/register")}
        >
          <Text style={[styles.buttonText, styles.registerButtonText]}>
            Register
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  splashContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  lottieAnimation: {
    width: 300,
    height: 300,
  },
  splashText: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: "#d90429",
    marginTop: 20,
  },
  logoContainer: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 300,
    height: 300,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: "#666",
    textAlign: "center",
    lineHeight: 38,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 40,
    gap: 15,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  signInButton: {
    backgroundColor: "#d90429",
  },
  registerButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#d90429",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
  },
  registerButtonText: {
    color: "#d90429",
    fontFamily: "Poppins-SemiBold",
  },
});
