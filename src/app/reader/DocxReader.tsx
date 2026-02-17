"use client";

import React, { useEffect, useRef, useState } from "react";

type DocxReaderProps = {
  url: string; // Firebase download URL (getDownloadURL result)
  className?: string;
};

export default function DocxReader({ url, className }: DocxReaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const styleRef = useRef<HTMLDivElement | null>(null); // optional style container
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);

      // sanity check
      if (!containerRef.current) {
        setError("Renderer container not available");
        setLoading(false);
        return;
      }

      try {
        // fetch docx as blob (works with Firebase signed URLs if CORS configured)
        const res = await fetch(url);
        if (!res.ok)
          throw new Error(
            `Failed to fetch DOCX: ${res.status} ${res.statusText}`
          );
        const blob = await res.blob();

        // dynamic import so this code only runs client-side and avoids SSR issues
        const lib = await import("docx-preview");
        // renderAsync signature: renderAsync(documentBlobOrBuffer, bodyContainer, styleContainer?, options?)
        await lib.renderAsync(
          blob,
          containerRef.current,
          styleRef.current ?? undefined,
          {
            className: "docx", // default prefix for classes inserted
          }
        );

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err: any) {
        console.error("DocxReader error:", err);
        if (!cancelled) {
          setError(err?.message || String(err));
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      // cleanup DOM inserted by docx-preview
      if (containerRef.current) containerRef.current.innerHTML = "";
      if (styleRef.current) styleRef.current.innerHTML = "";
    };
  }, [url]);

  return (
    <div className={`docx-reader-root ${className ?? ""} flex flex-col h-full`}>
      <div className="docx-reader-toolbar p-2 border-b flex items-center justify-between">
        <div>
          <strong>DOCX Viewer</strong>
        </div>
        <div className="text-sm text-muted-foreground">
          {loading ? "Loading…" : error ? "Error" : ""}
        </div>
      </div>

      <div className="docx-reader-body flex-1 min-h-0 overflow-auto p-4 bg-white">
        {loading && !error && (
          <div className="flex items-center justify-center h-full text-gray-600">
            Loading document...
          </div>
        )}

        {error && (
          <div className="p-4 text-red-500">
            <strong>Unable to load document:</strong> {error}
          </div>
        )}

        {/* The style container is optional but recommended if you want docx-preview to inject styles separately */}
        {/* <div ref={styleRef} style={{ display: "none" }} /> */}

        {/* Where docx-preview will render the HTML content */}
        <div ref={containerRef} />
      </div>
    </div>
  );
}
