import { supabase } from "../lib/supabase";

export const register = async (userData) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.fullName,
        },
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message || "Registration failed");
  }
};

export const loginWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message || "Google login failed");
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    throw new Error(error.message || "Sign out failed");
  }
};
