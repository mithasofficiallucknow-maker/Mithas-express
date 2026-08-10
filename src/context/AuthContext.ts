"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase.config";
import { DriverProfile } from "@/types";

interface AuthContextType {
  currentUser: User | null;
  driverProfile: DriverProfile | null;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    // Listen to Firebase Authentication state changes
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Cleanup previous profile listener when user changes or logs out
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      setCurrentUser(user);
      
      if (user) {
        // If authenticated, listen to their Firestore profile in real-time
        const driverRef = doc(db, "drivers", user.uid);
        unsubProfile = onSnapshot(
          driverRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setDriverProfile(docSnap.data() as DriverProfile);
            } else {
              setDriverProfile(null);
            }
            setAuthLoading(false);
          },
          (error) => {
            console.error("[Mithaas Express] Failed to sync driver profile:", error);
            setAuthLoading(false);
          }
        );
      } else {
        // No user logged in
        setDriverProfile(null);
        setAuthLoading(false);
      }
    });

    // Cleanup all listeners on unmount to prevent memory leaks
    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, driverProfile, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
