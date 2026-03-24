"use client";

import { useRef } from "react";

export function AdminPhotoCarousel({
  urls,
  alt,
}: {
  urls: string[];
  alt: string;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  if (urls.length === 0) return null;
  const showControls = urls.length > 1;

  const scrollByOne = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const width = el.clientWidth;
    el.scrollBy({
      left: direction === "left" ? -width : width,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative mb-4 overflow-hidden rounded-xl bg-white/5">
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
      >
        {urls.map((src) => (
          <div key={src} className="min-w-0 flex-[0_0_100%] snap-center">
            <div className="aspect-[4/5] overflow-hidden rounded-xl">
              <img
                src={src}
                alt={alt}
                className="h-full w-full object-contain"
                style={{ imageOrientation: "from-image" }}
              />
            </div>
          </div>
        ))}
      </div>

      {showControls && (
        <>
          <button
            type="button"
            onClick={() => scrollByOne("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-2 py-1 text-xs text-white hover:bg-black/70"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollByOne("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-2 py-1 text-xs text-white hover:bg-black/70"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}

