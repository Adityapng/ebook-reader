import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
      clientEmail: process.env.FB_CLIENT_EMAIL,
      privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function GET(req: Request) {
  // ✅ Correct: pass headers only
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Create Firebase custom token using BetterAuth user ID
  const customToken = await admin.auth().createCustomToken(session.user.id);

  return NextResponse.json({ token: customToken });
}
