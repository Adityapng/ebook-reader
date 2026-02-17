"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Epub, { Book, Rendition } from "epubjs";
import { useTheme } from "next-themes";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  List,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { updateProgressAction } from "@/app/actions/documents";

interface EpubReaderProps {
  url: string;
  title?: string;
  id: string;
}

interface TocItem {
  id: string;
  label: string;
  href: string;
  subitems?: TocItem[];
}

export default function EpubReader({ url, title, id }: EpubReaderProps) {
  const { theme } = useTheme();
  const viewerRef = useRef<HTMLDivElement>(null);

  // EpubJS Instances
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);

  // Progress State
  const [currentCfi, setCurrentCfi] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [pageInfo, setPageInfo] = useState<{
    current: number;
    total: number;
  } | null>(null);

  // Settings
  const [fontSize, setFontSize] = useState(100);

  const saveToDb = useDebouncedCallback(
    async (cfi: string, percentage: number) => {
      // This runs on the server, securely updating Neon
      await updateProgressAction(id, cfi, percentage);
    },
    1000
  );

  // 1. Initialize Book
  useEffect(() => {
    if (!url || !viewerRef.current) return;

    // Initialize
    const newBook = Epub(url);
    bookRef.current = newBook;

    const newRendition = newBook.renderTo(viewerRef.current, {
      width: "100%",
      height: "100%",
      flow: "paginated",
      manager: "default",
    });
    renditionRef.current = newRendition;

    // 2. Check for Saved Progress in LocalStorage
    const savedLocation = localStorage.getItem(`ebook-progress-${id}`);

    // 3. Render (Display)
    newRendition
      .display(savedLocation || undefined)
      .then(() => {
        setIsReady(true);
        registerThemes(newRendition);

        // 4. Generate "Locations" (Page numbers)
        // This scans the book to calculate total pages.
        // 1000 chars is a rough estimate for one "page".
        return newBook.locations.generate(1000);
      })
      .then(() => {
        // Once locations are generated, update the UI immediately
        updatePageInfo(newRendition.location);
      })
      .catch((err: any) => {
        console.error("Error rendering book:", err);
        toast.error("Failed to load book.");
      });

    // Load Table of Contents
    newBook.loaded.navigation.then((nav: any) => {
      setToc(nav.toc);
    });

    // 5. Listen for Location Changes (Page Turns)
    newRendition.on("relocated", (location: any) => {
      const cfi = location.start.cfi;
      const percentage = Math.round(location.start.percentage * 100);
      // A. Save to LocalStorage IMMEDIATELY (Fast backup)
      localStorage.setItem(`ebook-progress-${id}`, cfi);

      // B. Update UI state IMMEDIATELY
      setCurrentCfi(cfi);
      if (location.start.percentage) {
        setProgressPercent(Math.round(location.start.percentage * 100));
      }

      // C. Trigger the debounced DB save
      // This won't actually run the fetch until 1 second of silence passes
      saveToDb(cfi, percentage);
    });

    return () => {
      if (newBook) {
        newBook.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, id, saveToDb]); // Re-run if URL or Book ID changes

  // Helper: Calculate Current Page / Total Pages
  const updatePageInfo = (location: any) => {
    if (!bookRef.current || !location) return;

    // Locations might not be ready immediately
    const locations = bookRef.current.locations;
    if (locations.length() > 0) {
      // locationFromCfi can return different shapes depending on the epubjs version/types.
      // Normalize to a number before storing in state to satisfy the expected types.
      const locResult: any = locations.locationFromCfi(location.start.cfi);
      let currentPageNum: number = 0;

      if (typeof locResult === "number") {
        currentPageNum = locResult;
      } else if (locResult && typeof locResult === "object") {
        // Try common numeric properties that may exist on the returned object
        if (typeof locResult.start === "number") {
          currentPageNum = locResult.start;
        } else if (typeof locResult.loc === "number") {
          currentPageNum = locResult.loc;
        } else if (typeof locResult.cfi === "number") {
          currentPageNum = locResult.cfi;
        } else {
          // Fallback: attempt numeric coercion
          const coerced = Number(locResult);
          currentPageNum = Number.isFinite(coerced) ? coerced : 0;
        }
      }

      // Use the generated locations length as the total page count (epubjs exposes length() not a 'total' prop)
      const totalPages =
        typeof locations.length === "function" ? locations.length() : 0;
      setPageInfo({ current: currentPageNum, total: totalPages });
    }
  };

  // --- Theme Handling ---
  useEffect(() => {
    if (renditionRef.current) {
      registerThemes(renditionRef.current);
      renditionRef.current.themes.select(theme === "dark" ? "dark" : "light");
    }
  }, [theme]);

  const registerThemes = (rend: Rendition) => {
    rend.themes.register("light", {
      body: { color: "#000000", background: "#ffffff" },
    });
    rend.themes.register("dark", {
      body: { color: "#e2e8f0", background: "#020817" },
      "h1, h2, h3, h4, h5": { color: "#f8fafc" },
      "p, span, div": { color: "#e2e8f0" },
    });
    rend.themes.select(theme === "dark" ? "dark" : "light");
  };

  // --- Font Size Handling ---
  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${fontSize}%`);
    }
  }, [fontSize]);

  // --- Controls ---
  const prevPage = useCallback(() => {
    renditionRef.current?.prev();
  }, []);

  const nextPage = useCallback(() => {
    renditionRef.current?.next();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevPage();
      if (e.key === "ArrowRight") nextPage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevPage, nextPage]);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.4))] w-full relative bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-2 border-b h-14 shrink-0">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <List className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Contents</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 h-full overflow-y-auto pb-20">
                <ul>
                  {toc.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          renditionRef.current?.display(item.href);
                        }}
                        className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded-md truncate"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
          <span className="font-medium text-sm truncate max-w-[150px] sm:max-w-md">
            {title || "Ebook Reader"}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setFontSize((s) => Math.min(s + 10, 200))}
            >
              Increase Font Size
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFontSize((s) => Math.max(s - 10, 50))}
            >
              Decrease Font Size
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Reader Area */}
      <div className="flex-1 relative overflow-hidden">
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-sm font-medium">Loading Book...</span>
          </div>
        )}
        <div ref={viewerRef} className="h-full w-full" />
      </div>

      {/* Footer with Page Numbers */}
      <div className="flex items-center justify-between p-4 border-t h-16 shrink-0 bg-background">
        <Button variant="outline" onClick={prevPage} disabled={!isReady}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-medium">
            {pageInfo
              ? `Page ${pageInfo.current} of ${pageInfo.total}`
              : `${progressPercent}%`}
          </span>
          {/* Optional: Tiny progress bar */}
          <div className="w-24 h-1 bg-secondary mt-1 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <Button variant="outline" onClick={nextPage} disabled={!isReady}>
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
