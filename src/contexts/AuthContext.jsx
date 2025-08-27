import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  ACCOUNT_STATUS,
  isAccountSuspended,
  isAccountDisabled,
} from "../constants/permissions";
import { AuthContext } from "./AuthContext.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Rate limiting configuration
  const RATE_LIMIT_CONFIG = {
    maxAttempts: 5,
    timeWindow: 15 * 60 * 1000, // 15 minutes
    blockDuration: 60 * 60 * 1000, // 1 hour
    progressiveDelays: {
      1: 0, // No delay after 1st failure
      2: 1000, // 1 second after 2nd failure
      3: 5000, // 5 seconds after 3rd failure
      4: 15000, // 15 seconds after 4th failure
      5: 60000, // 1 minute after 5th failure
    },
  };

  // Rate limiting functions
  const getLoginAttempts = () => {
    try {
      const attempts = localStorage.getItem("loginAttempts");
      return attempts ? JSON.parse(attempts) : [];
    } catch (error) {
      console.error("Error reading login attempts:", error);
      return [];
    }
  };

  const saveLoginAttempts = (attempts) => {
    try {
      localStorage.setItem("loginAttempts", JSON.stringify(attempts));
    } catch (error) {
      console.error("Error saving login attempts:", error);
    }
  };

  const recordLoginAttempt = (email, success) => {
    const attempts = getLoginAttempts();
    const now = Date.now();

    // Add new attempt
    attempts.push({
      email,
      success,
      timestamp: now,
      ip: "client", // In a real app, you'd get the actual IP
    });

    // Clean up old attempts (older than 24 hours)
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const recentAttempts = attempts.filter(
      (attempt) => attempt.timestamp > oneDayAgo
    );

    saveLoginAttempts(recentAttempts);
    return recentAttempts;
  };

  const checkRateLimit = (email) => {
    const attempts = getLoginAttempts();
    const now = Date.now();

    // Get failed attempts for this email in the time window
    const failedAttempts = attempts.filter(
      (attempt) =>
        attempt.email === email &&
        !attempt.success &&
        attempt.timestamp > now - RATE_LIMIT_CONFIG.timeWindow
    );

    const attemptCount = failedAttempts.length;

    // Check if blocked
    if (attemptCount >= RATE_LIMIT_CONFIG.maxAttempts) {
      const lastAttempt = failedAttempts[failedAttempts.length - 1];
      const timeSinceLastAttempt = now - lastAttempt.timestamp;

      if (timeSinceLastAttempt < RATE_LIMIT_CONFIG.blockDuration) {
        const remainingTime = Math.ceil(
          (RATE_LIMIT_CONFIG.blockDuration - timeSinceLastAttempt) / 1000 / 60
        );
        return {
          blocked: true,
          remainingMinutes: remainingTime,
          message: `Too many failed attempts. Please try again in ${remainingTime} minutes.`,
        };
      }
    }

    // Check if we need to apply progressive delay
    const delay = RATE_LIMIT_CONFIG.progressiveDelays[attemptCount] || 0;

    return {
      blocked: false,
      delay,
      attemptCount,
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts - attemptCount,
    };
  };

  const clearLoginAttempts = (email) => {
    const attempts = getLoginAttempts();
    const clearedAttempts = attempts.filter(
      (attempt) => attempt.email !== email
    );
    saveLoginAttempts(clearedAttempts);
  };

  // Check if token expires soon (within 5 minutes)
  const isTokenExpiringSoon = (token) => {
    if (!token || !token.expires_at) return false;
    const expiresAt = token.expires_at * 1000; // Convert to milliseconds
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    return expiresAt < fiveMinutesFromNow;
  };

  // Automatically refresh token when it's about to expire
  const refreshTokenIfNeeded = async () => {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (currentSession && isTokenExpiringSoon(currentSession)) {
        console.log("🔄 Token expiring soon, refreshing...");

        const { data, error } = await supabase.auth.refreshSession();

        if (error) {
          console.error("❌ Token refresh failed:", error);
          // If refresh fails, sign out the user
          await signOut();
          return;
        }

        if (data.session) {
          console.log("✅ Token refreshed successfully");
          setSession(data.session);
          setUser(data.session.user);
          if (data.session.user) {
            await getProfile(data.session.user.id);
          }
        }
      }
    } catch (error) {
      console.error("❌ Error checking token refresh:", error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const userProfile = await getProfile(session.user.id);
        // Check account status on initial load
        if (userProfile) {
          const accountStatus =
            userProfile.account_status || ACCOUNT_STATUS.ACTIVE;
          if (
            isAccountSuspended(accountStatus) ||
            isAccountDisabled(accountStatus)
          ) {
            console.log("🔒 Account suspended/disabled on initial load");
            setUser(null);
            setProfile(null);
            setSession(null);
            // Sign out the user
            await supabase.auth.signOut();
          }
        }
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth state changed:", event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const userProfile = await getProfile(session.user.id);
        // Check account status on auth state change
        if (userProfile) {
          const accountStatus =
            userProfile.account_status || ACCOUNT_STATUS.ACTIVE;
          if (
            isAccountSuspended(accountStatus) ||
            isAccountDisabled(accountStatus)
          ) {
            console.log("🔒 Account suspended/disabled on auth state change");
            setUser(null);
            setProfile(null);
            setSession(null);
            // Sign out the user
            await supabase.auth.signOut();
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set up periodic token refresh checking (every 2 minutes)
  useEffect(() => {
    if (!user) return; // Only check if user is logged in

    const interval = setInterval(refreshTokenIfNeeded, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [user]);

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
        return data[0]; // Return the profile data
      }
      return null;
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

      // Check rate limiting before attempting login
      const rateLimitCheck = checkRateLimit(email);

      if (rateLimitCheck.blocked) {
        console.log(
          "🚫 Login blocked due to rate limiting:",
          rateLimitCheck.message
        );
        return {
          data: null,
          error: new Error(rateLimitCheck.message),
        };
      }

      // Apply progressive delay if needed
      if (rateLimitCheck.delay > 0) {
        console.log(
          `⏳ Applying ${rateLimitCheck.delay}ms delay due to ${rateLimitCheck.attemptCount} previous failed attempts`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, rateLimitCheck.delay)
        );
      }

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

        // Record successful login attempt
        recordLoginAttempt(email, true);

        // Clear any previous failed attempts for this email
        clearLoginAttempts(email);

        // Check account status BEFORE setting user state
        if (result.user) {
          const userProfile = await getProfile(result.user.id);

          // Check account status after getting profile
          if (userProfile) {
            const accountStatus =
              userProfile.account_status || ACCOUNT_STATUS.ACTIVE;

            if (isAccountSuspended(accountStatus)) {
              console.log(
                "🔒 Account suspended:",
                userProfile.suspension_reason
              );
              // Don't set user state - keep them logged out
              return {
                data: null,
                error: new Error(
                  `Account suspended: ${
                    userProfile.suspension_reason || "No reason provided"
                  }`
                ),
              };
            }

            if (isAccountDisabled(accountStatus)) {
              console.log("🚫 Account disabled");
              // Don't set user state - keep them logged out
              return {
                data: null,
                error: new Error("Account has been permanently disabled"),
              };
            }
          }
        }

        // Only set user state if account status checks pass
        setUser(result.user);
        setSession(result);

        return { data: { user: result.user, session: result }, error: null };
      } else {
        console.error("❌ Direct authentication failed:", result);

        // Record failed login attempt
        recordLoginAttempt(email, false);

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

  const refreshSession = async () => {
    try {
      console.log("🔄 Manually refreshing session...");
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error("❌ Manual session refresh failed:", error);
        return { error };
      }

      if (data.session) {
        console.log("✅ Manual session refresh successful");
        setSession(data.session);
        setUser(data.session.user);
        if (data.session.user) {
          await getProfile(data.session.user.id);
        }
        return { data: data.session, error: null };
      }

      return { error: new Error("No session data returned") };
    } catch (error) {
      console.error("❌ Error in manual session refresh:", error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("🔐 Starting sign out process...");

      // Set loading state for better UX
      setLoading(true);

      // Clear user and profile state immediately for better UX
      setUser(null);
      setProfile(null);

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("❌ Sign out error:", error);
        // Even if Supabase signout fails, we've cleared local state
        setLoading(false);
        return { error };
      }

      console.log("✅ Sign out successful");

      // Clear any local storage or session storage if needed
      localStorage.removeItem("supabase.auth.token");
      sessionStorage.clear();

      // Force a page reload to clear any cached data
      window.location.reload();

      return { error: null };
    } catch (error) {
      console.error("❌ Error signing out:", error);
      // Clear state even if there's an error
      setUser(null);
      setProfile(null);
      setLoading(false);
      return { error };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    refreshSession,
    checkRateLimit,
    clearLoginAttempts,
    isAdmin: profile?.role === "admin",
    isAssessor: profile?.role === "assessor",
    isCustomer: profile?.role === "customer",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
