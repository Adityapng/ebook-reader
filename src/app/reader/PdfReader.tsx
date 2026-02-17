"use client";
import { Document, Page, pdfjs } from "react-pdf";
import { useState, useEffect } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ArrowLeftIcon, ArrowRightIcon, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { IconFileOrientation } from "@tabler/icons-react";
import { updateProgressAction } from "@/app/actions/documents";
import { useDebouncedCallback } from "use-debounce";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfReaderProps {
  url: string;
  id: string;
}

export default function PdfReader({ url, id }: PdfReaderProps) {
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0); // actual render scale (quality)
  const [width, setWidth] = useState(0);
  const orientations = [0, 90, 180, 270];
  const [currentOrientationIndex, setCurrentOrientationIndex] = useState(0);
  // console.log(url);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const blob = await res.blob();
        setFileBlob(blob);
      } catch (err: any) {
        console.error("Failed to fetch PDF:", err);
        setError(err.message);
      }
    })();
  }, [url]);

  useEffect(() => {
    function handleResize() {
      const newWidth = Math.min(window.innerWidth * 0.9, 900); // max 800px
      setWidth(newWidth);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const saveToDb = useDebouncedCallback(
    async (location: string, percentage: number) => {
      await updateProgressAction(id, location, percentage);
    },
    1000
  );

  if (error) return <p className="text-red-500 p-4">Error: {error}</p>;
  if (!fileBlob) return <p className="p-4">Loading PDF...</p>;

  return (
    <div className="relative flex flex-col items-center gap-2 p-4 bg-background h-screen overflow-y-auto">
      {/* Sticky toolbar */}
      <div className="sticky top-2 z-10 flex items-center gap-2  backdrop-blur-md rounded-md shadow-md">
        <ButtonGroup>
          {/* <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous"
            className="dark:bg-black"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber === 1}
          >
            <ArrowLeftIcon />
          </Button> */}
          <Button
            variant="outline"
            size="sm"
            aria-label="Zoom Out"
            className="dark:bg-black"
            onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
          >
            <ZoomOut />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="dark:bg-black"
            onClick={() =>
              setCurrentOrientationIndex(
                (prev) => (prev + 1) % orientations.length
              )
            }
            aria-label="Toggle Orientation"
          >
            <IconFileOrientation />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="dark:bg-black dark:border-input text-white"
          >
            {pageNumber} of {numPages}
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Zoom In"
            className="dark:bg-black"
            onClick={() => setScale((s) => Math.min(s + 0.25, 3))}
          >
            <ZoomIn />
          </Button>
          {/* <Button
            variant="outline"
            className="dark:bg-black"
            size="icon-sm"
            aria-label="Next"
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber === numPages}
          >
            <ArrowRightIcon />
          </Button> */}
        </ButtonGroup>
      </div>

      {/* PDF Viewer */}
      <Document
        file={fileBlob}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        className="mt-4 space-y-4"
      >
        {Array.from(new Array(numPages), (_, index) => (
          <Page
            rotate={orientations[currentOrientationIndex]}
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={width}
            scale={scale}
            renderAnnotationLayer={true} // set to true if you want annotation layer
            renderTextLayer={true}
          />
        ))}
      </Document>

      {/* <div className="flex gap-3 mt-3">
        <p className="text-sm text-gray-600">
          Page {pageNumber} of {numPages}
        </p>
      </div> */}
    </div>
  );
}
