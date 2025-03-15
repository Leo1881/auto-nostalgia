import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Platform,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    async function prepare() {
      try {
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: Platform.OS !== "web",
        }).start();

        // Wait for 2 seconds with full opacity
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Fade out animation
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: Platform.OS !== "web",
        }).start();

        // Wait for fade out to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return (
      <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
        <Image
          source={require("./assets/logo.png")}
          style={styles.splashImage}
          resizeMode="contain"
        />
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  splashContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff", // Match your splash background color
  },
  splashImage: {
    width: "80%", // Adjust this value based on your logo size
    height: "80%", // Adjust this value based on your logo size
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
