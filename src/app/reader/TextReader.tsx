// // src/reader/TextReader.tsx
// "use client";

// import React, { useEffect, useState } from "react";

// type Props = {
//   url: string;
//   fileName?: string;
//   contentType?: string | null;
// };

// export default function TextReader({ url, fileName, contentType }: Props) {
//   const [text, setText] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;
//     setLoading(true);
//     setError(null);
//     setText(null);

//     (async () => {
//       try {
//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
//         // If it's plain text or known text-like MIME, read as text
//         const ct = res.headers.get("content-type") || contentType || "";
//         if (
//           ct.includes("text") ||
//           ct.includes("plain") ||
//           ct.includes("json")
//         ) {
//           const t = await res.text();
//           if (!cancelled) setText(t);
//         } else if (ct.includes("rtf")) {
//           // Some browsers don't render RTF to HTML — show raw RTF as fallback
//           const t = await res.text();
//           if (!cancelled) setText(t);
//         } else {
//           // Not a text-based file type — user probably selected wrong reader
//           throw new Error(
//             "Unsupported text format (not detected as text/rtf)."
//           );
//         }
//       } catch (e: any) {
//         console.error(e);
//         if (!cancelled) setError(e.message || "Failed to load file");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [url, contentType]);

//   if (loading)
//     return (
//       <div className="flex items-center justify-center h-full">
//         <div className="text-sm">Loading text…</div>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="p-4 text-sm text-red-600">
//         <strong>Error:</strong> {error}
//       </div>
//     );

//   if (text === null)
//     return (
//       <div className="p-4 text-sm text-gray-600">
//         No text available to display.
//       </div>
//     );

//   // Render RTF raw or plain text; you may later convert RTF -> HTML server-side if needed
//   const isRtf =
//     (contentType || "").includes("rtf") || text.startsWith("{\\rtf");

//   return (
//     <div className="flex flex-col h-full">
//       <header className="p-3 border-b">
//         <h2 className="text-lg font-medium dark:text-black">{fileName}</h2>
//       </header>

//       <main className=" overflow-auto p-4 bg-black/90">
//         {isRtf ? (
//           <div className="whitespace-pre-wrap text-sm dark:text-white/90">
//             {/* RTF shown raw — you can replace this with a proper converter later */}
//             {text}
//           </div>
//         ) : (
//           <pre className="whitespace-pre-wrap text-sm dark:text-white/90">
//             {text}
//           </pre>
//         )}
//       </main>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/vs2015.css";

type TextReaderProps = {
  url: string;
};

export default function TextReader({ url }: TextReaderProps) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchText() {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`);
        const text = await res.text();
        setContent(text);
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchText();
  }, [url]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400 text-sm">
        ⚠️ {error}
      </div>
    );
  }

  if (content === null) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Loading file...
      </div>
    );
  }

  const lines = content.split("\n");

  return (
    <div className="flex h-full bg-[#1e1e1e] text-gray-100 font-mono text-sm rounded-lg overflow-hidden shadow-md border border-gray-700">
      {/* Line numbers */}
      <div className="bg-[#252526] text-gray-500 px-3 py-3 text-right select-none border-r border-gray-700 overflow-y-auto">
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      {/* Text content */}
      <pre
        className="flex-1 overflow-auto p-3"
        dangerouslySetInnerHTML={{
          __html: hljs.highlightAuto(content).value,
        }}
      ></pre>
    </div>
  );
}
