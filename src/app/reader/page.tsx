"use client";

import { firebaseAuth, firebaseStorage } from "@/lib/firebase";
import { ensureFirebaseAuth } from "@/lib/firebase-auth";
import { ref, getDownloadURL, getMetadata, listAll } from "firebase/storage";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useMemo } from "react";
import { Loader2, FileWarning, Bug } from "lucide-react";

// --- Dynamic Imports (Disable SSR) ---
const PdfReader = dynamic(() => import("./PdfReader"), { ssr: false });
const EpubReader = dynamic(() => import("./EpubReader"), { ssr: false });
const TextReader = dynamic(() => import("./TextReader"), { ssr: false });
const DocxReader = dynamic(() => import("./DocxReader"), { ssr: false });

// --- Types ---
type FileItem = {
  name: string;
  url: string;
  fullPath?: string;
  storagePath?: string; // Handle alternate naming
  type?: string | null;
  size?: number;
  updated?: string;
};

// --- Logic Component ---
function ReaderContent() {
  const searchParams = useSearchParams();
  const fileParam = searchParams.get("file");

  const [file, setFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Initial Parse: Read data immediately from URL
  const initialData = useMemo<FileItem | null>(() => {
    if (!fileParam) return null;
    try {
      const decoded = decodeURIComponent(fileParam);

      const parsed = JSON.parse(decoded);

      // Normalize data if passed as string or object
      console.log(typeof parsed);
      if (typeof parsed === "string") {
        return { name: parsed, url: "", fullPath: "" };
      }
      return parsed;
    } catch (e) {
      console.error("Failed to parse URL param", e);
      return null;
    }
  }, [fileParam]);

  // 2. Fetch Fresh Data (Resilient)
  useEffect(() => {
    const loadFile = async () => {
      if (!initialData) {
        setLoading(false);
        return;
      }

      setLoading(true);
      let finalFile: FileItem = { ...initialData };

      try {
        // Ensure firebase auth (your ensureFirebaseAuth may sign-in anonymously)
        await ensureFirebaseAuth().catch((err) =>
          console.warn("ensureFirebaseAuth() warning:", err)
        );

        const uid = firebaseAuth.currentUser?.uid;
        if (!uid) {
          throw new Error("Not authenticated (no firebaseAuth.currentUser)");
        }

        // Build a likely fullPath from the filename you passed in the URL.
        // Adjust this template if your uploads live in a different folder.
        let guessedPath = `users/${uid}/ebooks/${initialData.name}`;

        // Normalise: remove accidental braces, leading/trailing whitespace
        guessedPath = guessedPath.trim().replace(/^\{+|\}+$/g, "");

        // Ensure it's not a folder path
        if (guessedPath.endsWith("/")) {
          throw new Error(
            "Guessed path appears to be a folder, not a file: " + guessedPath
          );
        }

        // Try direct reference
        const guessRef = ref(firebaseStorage, guessedPath);

        // First try: if the URL was already provided in the query, use it (fast & avoids permission issues)
        if (!finalFile.url && initialData.url) {
          finalFile.url = initialData.url;
        }

        // Try to get a fresh signed URL if we don't already have one
        if (!finalFile.url) {
          try {
            finalFile.url = await getDownloadURL(guessRef);
          } catch (err) {
            console.warn(
              "getDownloadURL on guessedPath failed:",
              guessedPath,
              err
            );
          }
        }

        // Try metadata on guessed path
        if (!finalFile.type || !finalFile.size) {
          try {
            const metadata = await getMetadata(guessRef);
            finalFile.type = metadata.contentType || finalFile.type;
            finalFile.name = metadata.name || finalFile.name;
            finalFile.size = metadata.size ?? finalFile.size;
            finalFile.updated = metadata.updated ?? finalFile.updated;
          } catch (err) {
            console.warn(
              "getMetadata on guessedPath failed:",
              guessedPath,
              err
            );
          }
        }

        // FALLBACK: if we still don't have a usable URL (403/404), try listing the user's ebooks folder
        // This is useful if uploaded files were prefixed (timestamp_name.pdf) but you only passed the visible name.
        if (!finalFile.url) {
          try {
            const folderRef = ref(firebaseStorage, `users/${uid}/ebooks`);
            const listRes = await listAll(folderRef);

            // try to find an exact name match first, otherwise try includes(...)
            let found = listRes.items.find(
              (it) => it.name === initialData.name
            );
            if (!found) {
              found = listRes.items.find((it) =>
                it.name.includes(initialData.name)
              );
            }

            if (found) {
              finalFile.fullPath = found.fullPath;
              finalFile.name = found.name;
              try {
                finalFile.url = await getDownloadURL(found);
                const md = await getMetadata(found);
                finalFile.type = md.contentType || finalFile.type;
                finalFile.size = md.size ?? finalFile.size;
                finalFile.updated = md.updated ?? finalFile.updated;
              } catch (err) {
                console.warn(
                  "Got reference but getDownloadURL/getMetadata failed:",
                  err
                );
              }
            } else {
              console.warn("No matching file found in user's ebooks folder.");
            }
          } catch (err) {
            console.warn("Fallback listAll failed (permissions?):", err);
          }
        }
      } catch (globalErr) {
        console.error("Global Reader Error:", globalErr);
      } finally {
        setFile(finalFile);
        setLoading(false);
      }
    };

    loadFile();
  }, [initialData]);

  // --- Rendering ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-gray-500 text-sm">Opening document...</p>
      </div>
    );
  }

  if (!file || !file.url) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-2">
        <FileWarning className="h-12 w-12 text-red-500" />
        <p className="font-bold">File not found</p>
        <p className="text-sm text-gray-500">
          The link may be broken or missing.
        </p>
      </div>
    );
  }

  // --- ROBUST TYPE DETECTION ---
  const lowerName = (file.name || "").toLowerCase();
  const lowerType = (file.type || "").toLowerCase();

  // Safe extension extraction (handles files with multiple dots)
  const parts = lowerName.split(".");
  const extension = parts.length > 1 ? parts.pop() : "";

  const isPdf = lowerType.includes("pdf") || extension === "pdf";
  const isEpub = lowerType.includes("epub") || extension === "epub";
  const isDoc =
    lowerType.includes("word") ||
    lowerType.includes("officedocument") ||
    extension === "docx" ||
    extension === "doc";
  const isText =
    lowerType.includes("text") ||
    lowerType.includes("plain") ||
    extension === "txt" ||
    extension === "md";

  // --- Render Specific Reader ---

  if (isPdf) {
    return <PdfReader url={file.url} id={file.fullPath || file.name} />;
  }

  if (isEpub) {
    return (
      <EpubReader
        url={file.url}
        id={file.fullPath || file.name}
        title={file.name}
      />
    );
  }

  if (isDoc) {
    return <DocxReader url={file.url} />;
  }

  if (isText) {
    return <TextReader url={file.url} />;
  }

  // --- Fallback Debug View ---
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 p-4 bg-gray-50 text-black">
      <div className="flex flex-col items-center gap-2">
        <FileWarning className="h-16 w-16 text-yellow-600" />
        <h2 className="text-2xl font-bold">Unsupported Format</h2>
        <p className="text-gray-600 text-sm">
          We could not determine how to open this file.
        </p>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm max-w-md w-full">
        <div className="flex items-center gap-2 mb-4 text-blue-600">
          <Bug className="h-5 w-5" />
          <span className="font-semibold text-sm uppercase">Debug Info</span>
        </div>

        <div className="space-y-2 text-sm font-mono break-all">
          <p>
            <strong>Name:</strong> {file.name || "MISSING"}
          </p>
          <p>
            <strong>Detected Ext:</strong> {extension || "NONE"}
          </p>
          <p>
            <strong>MIME Type:</strong> {file.type || "MISSING"}
          </p>
          <p>
            <strong>Path:</strong> {file.fullPath || "MISSING"}
          </p>
          <div className="pt-2 border-t mt-2">
            <strong>URL:</strong>
            <span className="text-xs text-gray-400 block mt-1">
              {file.url.substring(0, 50)}...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Export ---
export default function ReaderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <ReaderContent />
    </Suspense>
  );
}
