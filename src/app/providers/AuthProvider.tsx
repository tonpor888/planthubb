'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type User } from "firebase/auth";

import {
  signUpUser,
  signInUser,
  signInWithFacebook,
  signOutUser,
  resendVerificationEmail,
  cancelAccount,
  fetchUserProfile,
  updateEmailVerificationFlag,
  onAuthChange,
  type SignUpPayload,
  type UserProfile,
} from "../../services/firebase/auth.service";
import { auth } from "@/lib/firebaseClient";

interface AuthContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  initializing: boolean;
  signUp: (payload: SignUpPayload) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signInFacebook: () => Promise<User>;
  signOut: () => Promise<void>;
  reloadUser: () => Promise<User | null>;
  resendVerification: () => Promise<void>;
  cancelRegistration: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  const hydrateProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null);
      return;
    }

    // ตรวจสอบว่าเป็น hardcoded admin หรือไม่
    if (user.uid.startsWith('admin-')) {
      const adminProfile = {
        uid: user.uid,
        email: user.email || '',
        firstName: 'Admin',
        lastName: 'PlantHub',
        role: 'admin' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: true,
      };
      setProfile(adminProfile);
      return;
    }

    const existingProfile = await fetchUserProfile(user.uid);

    if (user.emailVerified && existingProfile && !existingProfile.emailVerified) {
      await updateEmailVerificationFlag(user.uid, true);
      setProfile({ ...existingProfile, emailVerified: true });
      return;
    }

    setProfile(existingProfile);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setFirebaseUser(user);
      await hydrateProfile(user);
      setInitializing(false);
    });

    return unsubscribe;
  }, [hydrateProfile]);

  const signUp = useCallback(async (payload: SignUpPayload) => {
    const user = await signUpUser(payload);
    setFirebaseUser(user);
    await hydrateProfile(user);
    return user;
  }, [hydrateProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const user = await signInUser(email, password);
    setFirebaseUser(user);
    await hydrateProfile(user);
    return user;
  }, [hydrateProfile]);

  const signInFacebook = useCallback(async () => {
    const user = await signInWithFacebook();
    setFirebaseUser(user);
    await hydrateProfile(user);
    return user;
  }, [hydrateProfile]);

  const signOut = useCallback(async () => {
    await signOutUser();
    setFirebaseUser(null);
    setProfile(null);
  }, []);

  const reloadUser = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setFirebaseUser(null);
      setProfile(null);
      return null;
    }

    await currentUser.reload();
    const refreshed = auth.currentUser;
    setFirebaseUser(refreshed);
    await hydrateProfile(refreshed);
    return refreshed;
  }, [hydrateProfile]);

  const resendVerification = useCallback(async () => {
    if (!auth.currentUser) {
      throw new Error("ไม่พบผู้ใช้งานที่กำลังเข้าสู่ระบบ");
    }
    await resendVerificationEmail(auth.currentUser);
  }, []);

  const cancelRegistration = useCallback(async () => {
    if (!auth.currentUser) {
      throw new Error("ไม่พบผู้ใช้งานที่กำลังเข้าสู่ระบบ");
    }
    await cancelAccount(auth.currentUser);
    setFirebaseUser(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    firebaseUser,
    profile,
    initializing,
    signUp,
    signIn,
    signInFacebook,
    signOut,
    reloadUser,
    resendVerification,
    cancelRegistration,
  }), [firebaseUser, profile, initializing, signUp, signIn, signInFacebook, signOut, reloadUser, resendVerification, cancelRegistration]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}

