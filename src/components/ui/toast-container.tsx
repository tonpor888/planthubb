'use client';

import { Toaster } from "react-hot-toast";

export function ToastContainer() {
  return <Toaster position="top-right" toastOptions={{ duration: 4000 }} />;
}


