import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContext.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await getProfile(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await getProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getProfile = async (userId) => {
    try {
      console.log("Fetching profile for user:", userId);

      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `https://qqkefsjuzxzyinotlkhw.supabase.co/rest/v1/profiles?id=eq.${userId}&select=*&limit=1`,
        {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Error fetching profile:", response.statusText);
        return;
      }

      const data = await response.json();
      console.log("Profile data:", data);

      if (data && data.length > 0) {
        setProfile(data[0]);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const signUp = async ({
    email,
    password,
    fullName,
    role = "customer",
    phoneNumber,
    location,
    contactMethod,
    experience,
  }) => {
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        return { data: null, error };
      }

      // If user was created successfully, create their profile
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: data.user.id,
                email: email,
                full_name: fullName,
                role: role,
              },
            ]);

          if (profileError) {
            // Don't throw here - user was created successfully
          }

          // If user selected assessor role, create assessor request
          if (role === "assessor") {
            try {
              const { error: assessorError } = await supabase
                .from("assessor_requests")
                .insert([
                  {
                    user_id: data.user.id,
                    phone_number: phoneNumber,
                    location: location,
                    contact_method: contactMethod,
                    experience: experience,
                    status: "pending",
                  },
                ]);

              if (assessorError) {
                // Handle silently
              }
            } catch {
              // Handle silently
            }
          }
        } catch {
          // Handle silently
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      console.log("🔐 Starting direct HTTP sign in...");

      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        "https://qqkefsjuzxzyinotlkhw.supabase.co/auth/v1/token?grant_type=password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const result = await response.json();
      console.log("Direct auth response:", result);

      if (response.ok && result.access_token) {
        console.log("✅ Direct authentication successful");

        // Don't use supabase.auth.setSession() as it hangs
        // Instead, manually set the user state
        setUser(result.user);
        if (result.user) {
          await getProfile(result.user.id);
        }

        return { data: { user: result.user, session: result }, error: null };
      } else {
        console.error("❌ Direct authentication failed:", result);
        return {
          data: null,
          error: new Error(
            result.error_description || result.error || "Authentication failed"
          ),
        };
      }
    } catch (error) {
      console.error("Sign in error:", error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin: profile?.role === "admin",
    isAssessor: profile?.role === "assessor",
    isCustomer: profile?.role === "customer",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
