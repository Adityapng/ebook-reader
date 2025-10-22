"use client";

import React, { useEffect, useState } from "react";
import { firebaseAuth, firebaseStorage } from "@/lib/firebase";
import { ensureFirebaseAuth } from "@/lib/firebase-auth";
import {
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  ListResult,
} from "firebase/storage";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { IconBook } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type FileItem = {
  name: string;
  url: string;
  fullPath?: string;
};

type EmptyLibProp = {
  uploading: boolean;
};

export default function Library() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await ensureFirebaseAuth();
        const uid = firebaseAuth.currentUser?.uid;
        if (!uid) throw new Error("Firebase user not found");
        await loadFiles(uid);
      } catch (err) {
        console.error("Library error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function loadFiles(uid: string) {
    const listRef = ref(firebaseStorage, `users/${uid}/ebooks`);
    // listAll - OK for small number of files. For many files, use pagination (list)
    const res: ListResult = await listAll(listRef);
    console.log(res);

    const mapped = await Promise.all(
      res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return { name: itemRef.name, url, fullPath: itemRef.fullPath };
      })
    );
    // sort by name or any metadata you want
    setItems(mapped);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget; // ✅ store reference before async
    const file = input.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (
      ![
        "pdf",
        "epub",
        "mobi",
        "azw",
        "azw3",
        "fb2",
        "txt",
        "rtf",
        "doc",
        "docx",
        "odt",
      ].includes(ext as string)
    ) {
      alert("Unsupported file type");
      return;
    }

    try {
      setUploading(true);
      await ensureFirebaseAuth();
      const uid = firebaseAuth.currentUser!.uid;

      const timestamp = Date.now();
      const safeName = `${timestamp}_${file.name}`;
      const fileRef = ref(firebaseStorage, `users/${uid}/ebooks/${safeName}`);
      await uploadBytes(fileRef, file);
      await loadFiles(uid);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (input) input.value = ""; // ✅ null-check before resetting
    }
  }

  function EmptyLibrary() {
    return (
      <div className="  flex justify-center items-center h-full">
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconBook />
            </EmptyMedia>
            <EmptyTitle>Document Library Empty</EmptyTitle>
            <EmptyDescription>
              Import files to your library to access them anywhere.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <input
              id="file"
              type="file"
              accept=".pdf,.epub,.mobi,.azw,.azw3,.fb2,.txt,.rtf,.doc,.docx,.odt"
              onChange={handleUpload}
              className="hidden"
            />
            <Button variant="outline" size="sm" asChild>
              <label
                htmlFor="file"
                // className="inline-block px-4 py-2 bg-slate-700 text-white rounded cursor-pointer"
              >
                {uploading ? "Uploading..." : "Upload PDF"}
              </label>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="p-4 h-full">
      <div className="h-full">
        {/* <h2 className="text-lg font-medium">Your library</h2> */}
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <EmptyLibrary />
        ) : (
          <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7  ">
            {items.map((it) => (
              <li key={it.fullPath}>
                <button
                  onClick={() => setSelectedUrl(it.url)}
                  className=" group block h-52 w-full rounded-2xl overflow-hidden shadow-sm bg-gradient-to-b from-slate-100/10 to-slate-400/10 hover:shadow-md hover:scale-[1.02] transition-transform "
                >
                  <div className="h-2/3 bg-slate-200/10 group-hover:bg-slate-300/20 transition-colors"></div>
                  <div className="h-1/3 bg-slate-400/10 flex flex-col justify-center px-3 py-2">
                    <a
                      className="truncate font-medium"
                      title={it.name.split(".")[0].split("_")[1]}
                    >
                      {it.name.split(".")[0].split("_")[1]}
                    </a>
                    <p className="text-xs text-muted-foreground">{`Last opened [x] ago`}</p>
                  </div>
                </button>
              </li>
            ))}

            {/* Add Document card */}
            <li>
              <label
                htmlFor="file"
                className=" h-52 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 bg-accent/30 cursor-pointer hover:bg-accent/50 transition-colors "
              >
                <Plus className="size-12 text-accent-foreground/80" />
                <p className="text-sm font-medium text-accent-foreground/90">
                  Add Document
                </p>
              </label>

              <input
                id="file"
                type="file"
                accept=".pdf,.epub,.mobi,.azw,.azw3,.fb2,.txt,.rtf,.doc,.docx,.odt"
                onChange={handleUpload}
                className="hidden"
              />
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
