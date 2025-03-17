import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity,
  Pressable,
  Image,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import LottieView from "lottie-react-native";
import { Player as LottiePlayer } from "@lottiefiles/react-lottie-player";
import * as Font from "expo-font";
import logoImage from "./assets/logo.png";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
          "Poppins-Medium": require("./assets/fonts/Poppins-Medium.ttf"),
          "Poppins-SemiBold": require("./assets/fonts/Poppins-SemiBold.ttf"),
          "Poppins-Bold": require("./assets/fonts/Poppins-Bold.ttf"),
        });
        setFontsLoaded(true);

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

  if (!fontsLoaded || showSplash) {
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
      <View style={styles.logoContainer}>
        <Image
          source={require("./assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>Your classic car companion</Text>
      </View>

      <View style={styles.buttonContainer}>
        {Platform.OS === "web" ? (
          <Pressable
            style={[styles.button, styles.signInButton]}
            onPress={() => console.log("Sign In pressed")}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </Pressable>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.signInButton]}
            onPress={() => console.log("Sign In pressed")}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        )}

        {Platform.OS === "web" ? (
          <Pressable
            style={[styles.button, styles.registerButton]}
            onPress={() => console.log("Register pressed")}
          >
            <Text style={[styles.buttonText, styles.registerButtonText]}>
              Register
            </Text>
          </Pressable>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.registerButton]}
            onPress={() => console.log("Register pressed")}
          >
            <Text style={[styles.buttonText, styles.registerButtonText]}>
              Register
            </Text>
          </TouchableOpacity>
        )}
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
