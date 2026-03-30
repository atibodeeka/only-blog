"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageSlideshowProps {
  urls: string[];
  className?: string;
}

export function ImageSlideshow({ urls, className = "" }: ImageSlideshowProps) {
  const [current, setCurrent] = useState(0);

  if (urls.length === 0) return null;

  if (urls.length === 1) {
    return (
      <div className={`overflow-hidden rounded-lg border ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={urls[0]}
          alt="Post image"
          className="w-full object-contain bg-muted/30"
        />
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + urls.length) % urls.length);
  const next = () => setCurrent((c) => (c + 1) % urls.length);

  return (
    <div className={`relative overflow-hidden rounded-lg border ${className}`}>
      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urls[current]}
        alt={`Image ${current + 1} of ${urls.length}`}
        className="w-full object-contain bg-muted/30"
      />

      {/* Prev / Next buttons */}
      <button
        onClick={prev}
        aria-label="Previous image"
        className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur border shadow hover:bg-background transition-colors">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={next}
        aria-label="Next image"
        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur border shadow hover:bg-background transition-colors">
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {urls.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to image ${i + 1}`}
            className={`h-2 w-2 rounded-full transition-colors border ${
              i === current
                ? "bg-foreground border-foreground"
                : "bg-background/60 border-foreground/40"
            }`}
          />
        ))}
      </div>

      {/* Counter */}
      <span className="absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur px-2 py-0.5 text-xs border">
        {current + 1} / {urls.length}
      </span>
    </div>
  );
}
