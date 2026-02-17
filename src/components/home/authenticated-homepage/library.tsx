"use client";

import { Ellipsis, LoaderCircle, Plus } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import Reader from "@/app/reader/page";
import { useRouter } from "next/navigation";

type FileItem = {
  name: string;
  url: string;
  fullPath?: string;
  type?: string | null; // from metadata.contentType
  size?: number; // in bytes
  updated?: string;
};

export default function Library({
  items,
  loading,

  uploading,
  handleUpload,
  deleteFiles,
}: {
  items: FileItem[];
  loading: boolean;

  uploading: boolean;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deleteFiles: (fullpath: string) => Promise<void>;
}) {
  // const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="  flex justify-center items-center h-full">
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconBook />
            </EmptyMedia>
            <EmptyTitle>Document Library Empty</EmptyTitle>
            <EmptyDescription>
              Your library is empty. Upload a document to get started.
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

  // if (selectedFile) {
  //   // console.log(selectedFile);

  //   return (
  //     <div className="flex flex-col h-full gap-1">
  //       <header className="p-3 border rounded-lg flex justify-between items-center">
  //         <h1>{selectedFile.name}</h1>
  //         <button onClick={() => setSelectedFile(null)}>Close</button>
  //       </header>
  //       <main className="flex-1  ">
  //         <Reader fileUrl={selectedFile} type={selectedFile} />
  //       </main>
  //     </div>
  //   );
  // }

  const router = useRouter();

  return (
    <ul className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      {items.map((it) => (
        <li
          key={it.fullPath}
          onClick={() =>
            router.push(
              `/reader?file=${encodeURIComponent(
                JSON.stringify(it.name) || ""
              )}`
            )
          }
        >
          <div className=" relative group block h-52 w-full rounded-2xl overflow-hidden shadow-sm bg-gradient-to-b from-slate-100/10 to-slate-400/10 hover:shadow-md hover:scale-[1.02] transition-transform">
            <div className=" absolute top-2.5 right-2.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="More Options"
                    className=" bg-accent"
                  >
                    <Ellipsis color="#ffffff" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Download</DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    className=""
                    onClick={() => deleteFiles(it.fullPath!)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="h-2/3 bg-slate-200/10 group-hover:bg-slate-300/20 transition-colors flex items-center justify-center">
              <p>{it.type}</p>
            </div>
            <div className="h-1/3 bg-slate-400/10 flex flex-col justify-center px-3 py-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <a className="truncate font-medium">
                    {it.name.split("_")[1]}
                    {/* {it.name.split(".")[0].split("_")[1]} */}
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p> {it.name.split("_")[1]}</p>
                </TooltipContent>
              </Tooltip>
              <p className="text-xs text-muted-foreground">{it.updated}</p>
            </div>
          </div>
        </li>
      ))}
      <li>
        <label
          htmlFor="file"
          className=" h-52 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 bg-accent/30 cursor-pointer hover:bg-accent/50 transition-colors "
        >
          {uploading ? (
            <>
              <LoaderCircle className=" animate-spin size-12 text-accent-foreground/80" />
              <p className="text-sm font-medium text-accent-foreground/90">
                Uploading...
              </p>
            </>
          ) : (
            <>
              <Plus className="size-12 text-accent-foreground/80" />
              <p className="text-sm font-medium text-accent-foreground/90">
                Add Document
              </p>
            </>
          )}
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
  );
}
