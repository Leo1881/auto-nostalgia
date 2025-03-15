import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import LottieView from "lottie-react-native";
import { Player as LottiePlayer } from "@lottiefiles/react-lottie-player";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for Lottie animation and display time
        await new Promise((resolve) => setTimeout(resolve, 2500));

        // Fade out splash screen
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: Platform.OS !== "web",
        }).start();

        // Wait for fade out to complete before hiding splash
        await new Promise((resolve) => setTimeout(resolve, 1000));
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
      <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
        {Platform.OS === "web" ? (
          <LottiePlayer
            autoplay
            loop={false}
            src={require("./assets/splash.json")}
            style={styles.lottieAnimation}
          />
        ) : (
          <LottieView
            source={require("./assets/splash.json")}
            autoPlay
            loop={false}
            style={styles.lottieAnimation}
          />
        )}
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Auto Nostalgia</Text>
      <Text style={styles.subtitle}>Your classic car companion</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  splashContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  lottieAnimation: {
    width: 400,
    height: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
