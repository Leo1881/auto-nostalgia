import { useEffect } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("Auth callback started");

        // Get the session from the URL hash
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");

        if (accessToken) {
          console.log("Access token found in URL");
          // Set the session
          const {
            data: { session },
            error,
          } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get("refresh_token"),
          });

          if (error) {
            console.error("Session error:", error);
            throw error;
          }

          console.log("Session set successfully:", session);
          router.replace("/dashboard");
        } else {
          // If no access token, try to get existing session
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          console.log("Existing session data:", session);

          if (error) {
            console.error("Session error:", error);
            throw error;
          }

          if (session) {
            console.log("Session exists, redirecting to dashboard");
            router.replace("/dashboard");
          } else {
            console.log("No session, redirecting to login");
            router.replace("/login");
          }
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        router.replace("/login");
      }
    };

    handleCallback();
  }, []);

  return null;
}
