import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCr9lA3_wFd4ge_UZqKoZRdcSk8uQo8ok4",
  authDomain: "planthub-694cf.firebaseapp.com",
  databaseURL: "https://planthub-694cf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "planthub-694cf",
  storageBucket: "planthub-694cf.firebasestorage.app",
  messagingSenderId: "922832086587",
  appId: "1:922832086587:web:8c02305bd07d3962e7de1e",
};

function createFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

export const firebaseApp = createFirebaseApp();

export const auth = getAuth(firebaseApp);
auth.useDeviceLanguage();

export const firestore = getFirestore(firebaseApp);
export const realtimeDb = getDatabase(firebaseApp);
export const storage = getStorage(firebaseApp);

// Enable offline persistence for Firestore
if (typeof window !== 'undefined') {
  import('firebase/firestore').then(({ enableNetwork }) => {
    // Enable network for better performance
    enableNetwork(firestore).catch(console.error);
  });
}

export const collections = {
  products: () => collection(firestore, "products"),
  orders: () => collection(firestore, "orders"),
  coupons: () => collection(firestore, "coupons"),
  couponDoc: (id: string) => doc(firestore, "coupons", id),
  orderDoc: (id: string) => doc(firestore, "orders", id),
};

export type { FirebaseApp };

