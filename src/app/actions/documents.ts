"use server";

import { db } from "@/drizzle/db";
import { documents } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper to get session
async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

// 1. Create Document
export async function createDocumentAction(data: {
  title: string;
  url: string;
  storagePath: string;
  mimeType: string;
  size: number;
}) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const [newDoc] = await db
      .insert(documents)
      .values({
        userId: session.user.id,
        title: data.title,
        url: data.url,
        storagePath: data.storagePath,
        mimeType: data.mimeType,
        size: data.size,
      })
      .returning();

    revalidatePath("/library"); // Refresh library page
    return { success: true, doc: newDoc };
  } catch (error) {
    console.error("Failed to create document:", error);
    return { success: false, error: "Failed to save document" };
  }
}

// 2. Get User Documents
export async function getUserDocuments() {
  const session = await getSession();
  if (!session?.user) return [];

  return await db
    .select()
    .from(documents)
    .where(eq(documents.userId, session.user.id))
    .orderBy(desc(documents.updatedAt));
}

// 3. Update Progress
export async function updateProgressAction(
  documentId: string,
  progress: string,
  percentage: number,
  isFinished: boolean = false
) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    await db
      .update(documents)
      .set({
        progress,
        progressPercentage: percentage,
        isFinished,
      })
      .where(
        and(eq(documents.id, documentId), eq(documents.userId, session.user.id))
      );

    revalidatePath("/library");
    return { success: true };
  } catch (error) {
    console.error("Progress update failed:", error);
    return { success: false };
  }
}

// 4. Delete Document
export async function deleteDocumentAction(documentId: string) {
  const session = await getSession();
  if (!session?.user) return { success: false };

  try {
    await db
      .delete(documents)
      .where(
        and(eq(documents.id, documentId), eq(documents.userId, session.user.id))
      );

    revalidatePath("/library");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Delete failed" };
  }
}
