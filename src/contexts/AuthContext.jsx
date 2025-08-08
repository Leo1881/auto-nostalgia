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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const signUp = async ({
    email,
    password,
    fullName,
    role = "customer",
    credentials,
    experience,
    reason,
    phoneNumber,
    location,
    contactMethod,
  }) => {
    try {
      console.log("🚀 Attempting signup for:", email, "as", role);

      // Determine the actual role to set in profile
      const profileRole = role === "assessor" ? "pending_assessor" : role;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: profileRole,
          },
        },
      });

      if (error) {
        console.error("❌ Signup error:", error);
        throw error;
      }

      // If user selected assessor, create assessor request
      if (role === "assessor" && data.user) {
        const { error: requestError } = await supabase
          .from("assessor_requests")
          .insert({
            user_id: data.user.id,
            credentials: credentials || "",
            experience: experience || "",
            reason: reason || "",
            phone_number: phoneNumber || "",
            location: location || "",
            contact_method: contactMethod || "",
            status: "pending",
          });

        if (requestError) {
          console.error("❌ Error creating assessor request:", requestError);
        } else {
          console.log("✅ Assessor request created successfully");
        }
      }

      console.log("✅ Signup successful:", data);
      return { data, error: null };
    } catch (error) {
      console.error("💥 Signup failed:", error);
      return { data: null, error };
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
