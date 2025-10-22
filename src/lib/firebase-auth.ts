// src/lib/firebase-auth.ts
import { firebaseAuth } from "@/lib/firebase";
import { signInWithCustomToken } from "firebase/auth";

export async function ensureFirebaseAuth(): Promise<void> {
  // if already signed in, nothing to do
  if (firebaseAuth.currentUser) return;

  const res = await fetch("/api/firebase-token");
  if (!res.ok) {
    throw new Error("Not authenticated with BetterAuth");
  }
  const { token } = await res.json();
  if (!token) throw new Error("No token returned from server");

  await signInWithCustomToken(firebaseAuth, token);
}
