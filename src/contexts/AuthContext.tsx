/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initialLoad, setInitialLoad] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Get initial session - no loading states, just set the data
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setInitialLoad(true); // Mark as initialized, but never show loading
        }
      } catch {
        if (mounted) {
          setInitialLoad(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes - never show loading
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        // Never set loading states during auth changes
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialLoad]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      // Clear local state immediately
      setUser(null);
      setSession(null);
      // Always redirect to home on sign out
      if (window.location.pathname !== "/") {
        window.history.replaceState(null, "", "/");
      }
    } catch (error) {
      console.error("Failed to sign out:", error);
      // Still clear local state even if server signout fails
      setUser(null);
      setSession(null);
      // Always redirect to home on sign out
      if (window.location.pathname !== "/") {
        window.history.replaceState(null, "", "/");
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
