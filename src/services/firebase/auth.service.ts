import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  FacebookAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  getAuth,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

import { auth, firestore, firebaseApp } from "../../lib/firebaseClient";
import { isHardcodedAdmin, getHardcodedAdmin } from "../../lib/adminConfig";
import { createLog, type LogAction } from "./logs.service";

export type AppUserRole = "customer" | "seller" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppUserRole;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  phone?: string;
  address?: string;
  profileImage?: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  storeName?: string;
  role?: AppUserRole;
}

const USERS_COLLECTION = "users";

export async function signUpUser(input: SignUpPayload) {
  const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);
  const { user } = credential;

  const displayName = input.storeName?.trim() || `${input.firstName} ${input.lastName}`.trim();

  await updateProfile(user, {
    displayName,
  });

  const profileRef = doc(firestore, USERS_COLLECTION, user.uid);

  await setDoc(profileRef, {
    uid: user.uid,
    email: user.email,
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.role ?? "customer",
    storeName: input.storeName ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    emailVerified: false,
  });

  await sendEmailVerification(user);

  // สร้าง log สำหรับการสมัครสมาชิก
  await createLog(
    user.uid,
    user.email || "",
    displayName,
    "REGISTER",
    `ผู้ใช้สมัครสมาชิกใหม่: ${user.email} (${input.role ?? "customer"})`,
    { role: input.role ?? "customer", storeName: input.storeName }
  );

  return user;
}

export async function signInUser(email: string, password: string) {
  // ตรวจสอบ hardcoded admin ก่อน
  if (isHardcodedAdmin(email, password)) {
    const adminData = getHardcodedAdmin(email);
    if (adminData) {
      // สร้าง log สำหรับแอดมิน
      await createLog(
        'admin-' + email.replace('@', '-').replace('.', '-'),
        email,
        adminData.displayName,
        "ADMIN_LOGIN",
        "แอดมินเข้าสู่ระบบ",
        { isHardcodedAdmin: true }
      );
      
      // สร้าง mock user object สำหรับ hardcoded admin
      const mockUser = {
        uid: 'admin-' + email.replace('@', '-').replace('.', '-'),
        email: email,
        displayName: adminData.displayName,
        emailVerified: true,
        role: adminData.role,
      } as any;
      return mockUser;
    }
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  
  // สร้าง log สำหรับผู้ใช้ทั่วไป
  await createLog(
    credential.user.uid,
    email,
    credential.user.displayName || "ผู้ใช้",
    "LOGIN",
    "ผู้ใช้เข้าสู่ระบบ",
    { emailVerified: credential.user.emailVerified }
  );
  
  return credential.user;
}

export async function signInWithFacebook() {
  const provider = new FacebookAuthProvider();
  provider.addScope('email');
  provider.addScope('public_profile');
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // ตรวจสอบว่ามี profile ใน Firestore หรือยัง
    const profileRef = doc(firestore, USERS_COLLECTION, user.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      // สร้าง profile ใหม่สำหรับผู้ใช้ Facebook
      const nameParts = (user.displayName || '').split(' ');
      const firstName = nameParts[0] || 'ผู้ใช้';
      const lastName = nameParts.slice(1).join(' ') || 'Facebook';

      await setDoc(profileRef, {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        role: "customer",
        profileImage: user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: true, // Facebook accounts are pre-verified
        provider: 'facebook',
      });

      // สร้าง log สำหรับการสมัครผ่าน Facebook
      await createLog(
        user.uid,
        user.email || "",
        user.displayName || "ผู้ใช้ Facebook",
        "REGISTER",
        `ผู้ใช้สมัครสมาชิกผ่าน Facebook: ${user.email}`,
        { provider: 'facebook' }
      );
    } else {
      // สร้าง log สำหรับการเข้าสู่ระบบผ่าน Facebook
      await createLog(
        user.uid,
        user.email || "",
        user.displayName || "ผู้ใช้ Facebook",
        "LOGIN",
        "ผู้ใช้เข้าสู่ระบบผ่าน Facebook",
        { provider: 'facebook' }
      );
    }

    return user;
  } catch (error: any) {
    // Handle specific Facebook errors
    if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('มีบัญชีที่ใช้อีเมลนี้อยู่แล้ว กรุณาเข้าสู่ระบบด้วยวิธีเดิม');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('ยกเลิกการเข้าสู่ระบบ');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('เบราว์เซอร์บล็อกหน้าต่างป๊อปอัพ กรุณาอนุญาตและลองใหม่อีกครั้ง');
    }
    throw error;
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function fetchUserProfile(uid: string) {
  const profileRef = doc(firestore, USERS_COLLECTION, uid);
  const snapshot = await getDoc(profileRef);
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  } as UserProfile;
}

export async function updateEmailVerificationFlag(uid: string, verified: boolean) {
  const profileRef = doc(firestore, USERS_COLLECTION, uid);
  await setDoc(profileRef, {
    emailVerified: verified,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function signOutUser() {
  const currentUser = auth.currentUser;
  
  // สร้าง log ก่อนออกจากระบบ
  if (currentUser) {
    await createLog(
      currentUser.uid,
      currentUser.email || "",
      currentUser.displayName || "ผู้ใช้",
      "LOGOUT",
      "ผู้ใช้ออกจากระบบ",
      { emailVerified: currentUser.emailVerified }
    );
  }
  
  await signOut(auth);
}

export async function resendVerificationEmail(user: User) {
  await sendEmailVerification(user);
}

export async function cancelAccount(user: User) {
  await deleteUser(user);
}

export const createUserByAdmin = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: AppUserRole
): Promise<{ uid: string; email: string }> => {
  try {
    // สร้างผู้ใช้ใน Firebase Auth โดยตรง
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // สร้างข้อมูลผู้ใช้ใน Firestore
    await setDoc(doc(firestore, "users", user.uid), {
      uid: user.uid,
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: role,
      emailVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: "admin", // ระบุว่าแอดมินเป็นคนสร้าง
    });

    // ส่งอีเมลยืนยัน
    await sendEmailVerification(user);

    // ส่งอีเมลตั้งรหัสผ่านใหม่ (เพื่อให้ผู้ใช้ตั้งรหัสผ่านเอง)
    await sendPasswordResetEmail(auth, email);

    // สร้าง log
    await createLog(
      user.uid,
      email,
      `${firstName} ${lastName}`,
      "USER_CREATED",
      `แอดมินสร้างผู้ใช้ใหม่: ${email} (${role})`,
      { role, createdBy: "admin" }
    );

    return { uid: user.uid, email };
  } catch (error) {
    console.error("Error creating user by admin:", error);
    throw error;
  }
};

