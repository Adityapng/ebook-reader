"use client";

import { useEffect, useState } from "react";
import { Session as BetterAuthSessionRecord, promise } from "better-auth";
import ProfileMenu from "../homepage-components/profile-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { IconAlpha, IconBook } from "@tabler/icons-react";
import { firebaseAuth, firebaseStorage } from "@/lib/firebase";
import { ensureFirebaseAuth } from "@/lib/firebase-auth";
import { getMetadata } from "firebase/storage";
import { createDocumentAction } from "@/app/actions/documents";
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  listAll,
  getDownloadURL,
  ListResult,
  deleteObject,
} from "firebase/storage";
import Library from "./library";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";

export type AuthClientSession = {
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
  };
  session: BetterAuthSessionRecord;
};

type FileItem = {
  name: string;
  url: string;
  fullPath?: string;
  type?: string | null; // from metadata.contentType
  size?: number; // in bytes
  updated?: string;
};

type AuthenticatedUserHomepageProps = {
  session: AuthClientSession;
};

export default function AuthenticatedUserHomepage({
  session,
}: AuthenticatedUserHomepageProps) {
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    const res: ListResult = await listAll(listRef);
    console.log(res.items, "ncsncmzncmmnzmncmzncncnc");

    const mapped = await Promise.all(
      res.items.map(async (itemRef) => {
        const [url, metadata] = await Promise.all([
          getDownloadURL(itemRef),
          getMetadata(itemRef),
        ]);

        // console.log(metadata);
        return {
          name: itemRef.name,
          url,
          fullPath: itemRef.fullPath,
          type: metadata.contentType || "unknown", // ✅ true MIME type
          size: metadata.size, // optional extras
          updated: metadata.updated,
        };
      })
    );

    setItems(mapped);
  }

  async function deleteFiles(fullpath: string) {
    const desertRef = ref(firebaseStorage, fullpath);
    deleteObject(desertRef)
      .then(() => {
        toast.success("File deleted successfully!");
        setItems((prev) => prev.filter((file) => file.fullPath !== fullpath));
      })
      .catch((error) => {
        toast.error("An error occured");
      });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
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
      toast.error("Unsupported file type!");
      return;
    }

    try {
      setUploading(true);
      await ensureFirebaseAuth();
      const uid = firebaseAuth.currentUser!.uid;
      const storageRef = ref(
        firebaseStorage,
        `books/${session.user.id}/${file.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, file);
      const timestamp = Date.now();
      const safeName = `${timestamp}_${file.name}`;
      const fileRef = ref(firebaseStorage, `users/${uid}/ebooks/${safeName}`);
      const uploadResult = await uploadBytes(fileRef, file);
      await loadFiles(uid);

      const downloadURL = await getDownloadURL(uploadResult.ref);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Upload failed", error);
        },
        async () => {
          // 4. Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // 5. NOW YOU USE IT IN YOUR SERVER ACTION
          const result = await createDocumentAction({
            title: file.name.replace(/\.[^/.]+$/, ""),
            url: downloadURL,

            // This gets the path like "books/user123/moby-dick.epub"
            // You need this to delete the file later
            storagePath: uploadTask.snapshot.ref.fullPath,

            mimeType: file.type,
            size: file.size,
          });
          if (result.success) {
            toast.success("Book added to library!");
          } else {
            toast.error("Failed to save to database.");
          }
        }
      );
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (input) input.value = "";
    }
  }

  return (
    <section className="h-full flex flex-col">
      <NavComponent
        session={session}
        uploading={uploading}
        handleUpload={handleUpload}
      />
      <section className="flex-1 min-w-0 p-5">
        <div className=" w-full rounded-2xl shadow-[0px_0px_10px_rgba(194,_194,_194,_0.2)] p-5">
          <Library
            items={items}
            loading={loading}
            uploading={uploading}
            handleUpload={handleUpload}
            deleteFiles={deleteFiles}
          />
        </div>
      </section>
    </section>
  );
}

// --------------------------------------------
// Navbar now includes the Upload button
// --------------------------------------------
function NavComponent({
  session,
  uploading,
  handleUpload,
}: AuthenticatedUserHomepageProps & {
  uploading: boolean;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <nav className="flex justify-between px-3 py-2 my-auto shrink-0 border-b">
      <div className="flex gap-2 items-center">
        <IconAlpha />
        <h1 className="text-xl font-bold">AlphaReader</h1>
        <SidebarTrigger className="ml-5" />
      </div>

      {/* Upload Button */}
      <div className="flex items-center gap-3">
        <input
          id="file"
          type="file"
          accept=".pdf,.epub,.mobi,.azw,.azw3,.fb2,.txt,.rtf,.doc,.docx,.odt"
          onChange={handleUpload}
          className="hidden"
        />
        <Button asChild variant="outline" size="sm" className=" rounded-full">
          <label
            htmlFor="file"
            className="cursor-pointer flex items-center gap-2"
          >
            {uploading ? (
              <>
                <LoaderCircle className=" animate-spin" />
                <span> Uploading...</span>
              </>
            ) : (
              <>
                <Plus className="size-4" />
                <span>Upload</span>
              </>
            )}
          </label>
        </Button>

        <ProfileMenu session={session} />
      </div>
    </nav>
  );
}
