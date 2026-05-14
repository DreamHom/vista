/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, ChevronLeft, ChevronRight, ImageIcon, RefreshCw, X } from "lucide-react";
import type { PublicPhoto } from "@/lib/seed/public-data";
import { cn } from "@/lib/utils";

const SWIPE_PX = 52;
const HOVER_INTERVAL_MS = 3200;

type DragRef = { x: number; pointerId: number } | null;

type LoadState = "loading" | "ready" | "error";

function PhotoWithStatus({
  photo,
  alt,
  className,
  imgClassName,
  sizes,
  priority,
  variant = "default",
}: {
  photo: PublicPhoto;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** Thumbnails sit inside parent buttons — no nested controls on error. */
  variant?: "default" | "thumb";
}) {
  const [state, setState] = useState<LoadState>("loading");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setState("loading");
  }, [photo.url, retryKey]);

  const retry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  const isThumb = variant === "thumb";

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {state === "loading" ? (
        <div className="absolute inset-0 z-[1] bg-muted motion-safe:animate-pulse" aria-hidden />
      ) : null}

      {state === "error" ? (
        <div
          className={cn(
            "absolute inset-0 z-[2] flex flex-col items-center justify-center gap-2 bg-muted p-2 text-center",
            isThumb ? "p-1" : "gap-3 p-4",
          )}
        >
          <AlertCircle className={cn("text-muted-foreground", isThumb ? "h-5 w-5" : "h-8 w-8")} aria-hidden />
          {!isThumb ? (
            <>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Couldn&apos;t load this image</p>
                <p className="text-xs text-muted-foreground">Check your connection and try again.</p>
              </div>
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center gap-2 border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                Try again
              </button>
            </>
          ) : (
            <span className="sr-only">Thumbnail failed to load</span>
          )}
        </div>
      ) : null}

      <img
        key={`${photo.url}-${retryKey}`}
        src={photo.url}
        alt={alt}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        onLoad={() => setState("ready")}
        onError={() => setState("error")}
        className={cn(
          imgClassName,
          "transition-opacity duration-200 ease-out",
          state === "ready" ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

export function ListingGallery({
  photos,
  title,
  className,
}: {
  photos: PublicPhoto[];
  title: string;
  className?: string;
}) {
  const n = photos.length;
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hoverCapable, setHoverCapable] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dragRef = useRef<DragRef>(null);
  const lightboxDragRef = useRef<DragRef>(null);
  const hoverIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pointerInsideRef = useRef(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const dialogLabelId = useId();
  const suppressOpenClickRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setHoverCapable(mq.matches);
    const onChange = () => setHoverCapable(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const goNext = useCallback(() => {
    if (n <= 1) return;
    setIndex((i) => (i + 1) % n);
  }, [n]);

  const goPrev = useCallback(() => {
    if (n <= 1) return;
    setIndex((i) => (i - 1 + n) % n);
  }, [n]);

  const clearHoverTimer = useCallback(() => {
    if (hoverIntervalRef.current != null) {
      clearInterval(hoverIntervalRef.current);
      hoverIntervalRef.current = null;
    }
  }, []);

  const startHoverTimer = useCallback(() => {
    if (n <= 1 || reduceMotion || !hoverCapable) return;
    clearHoverTimer();
    hoverIntervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, HOVER_INTERVAL_MS);
  }, [n, reduceMotion, hoverCapable, clearHoverTimer]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) clearHoverTimer();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [clearHoverTimer]);

  useEffect(() => {
    return () => clearHoverTimer();
  }, [clearHoverTimer]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const t = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, goNext, goPrev]);

  const openLightbox = useCallback(() => {
    if (n === 0) return;
    setLightboxOpen(true);
  }, [n]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (n <= 1) return;
    clearHoverTimer();
    dragRef.current = { x: e.clientX, pointerId: e.pointerId };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const endPointerDrag = (e: React.PointerEvent) => {
    const start = dragRef.current;
    if (start && start.pointerId === e.pointerId) {
      dragRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      const dx = e.clientX - start.x;
      if (Math.abs(dx) >= SWIPE_PX) {
        suppressOpenClickRef.current = true;
        window.setTimeout(() => {
          suppressOpenClickRef.current = false;
        }, 420);
        if (dx < 0) goNext();
        else goPrev();
      }
    }
    if (pointerInsideRef.current) startHoverTimer();
  };

  const onLightboxPointerDown = (e: React.PointerEvent) => {
    if (n <= 1) return;
    lightboxDragRef.current = { x: e.clientX, pointerId: e.pointerId };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onLightboxPointerUp = (e: React.PointerEvent) => {
    const start = lightboxDragRef.current;
    if (start && start.pointerId === e.pointerId) {
      lightboxDragRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      const dx = e.clientX - start.x;
      if (Math.abs(dx) >= SWIPE_PX) {
        if (dx < 0) goNext();
        else goPrev();
      }
    }
  };

  const onGalleryActivate = useCallback(() => {
    if (suppressOpenClickRef.current) return;
    openLightbox();
  }, [openLightbox]);

  if (n === 0) {
    return (
      <div
        className={cn(
          "flex aspect-[4/3] flex-col items-center justify-center gap-2 border border-border bg-muted p-6 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        <ImageIcon className="h-10 w-10 opacity-40" aria-hidden />
        <p>No photos yet</p>
      </div>
    );
  }

  const transitionClass = reduceMotion ? "duration-150 ease-out" : "duration-700 ease-out";

  const extraPreviewCount = n > 1 ? Math.min(3, n - 1) : 0;
  const previewIndices = useMemo(
    () => Array.from({ length: extraPreviewCount }, (_, k) => (index + k + 1) % n),
    [extraPreviewCount, index, n],
  );

  useEffect(() => {
    if (!lightboxOpen || !thumbStripRef.current || n <= 1) return;
    const el = thumbStripRef.current.querySelector<HTMLElement>(`[data-thumb-index="${index}"]`);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  }, [index, lightboxOpen, n, reduceMotion]);

  const lightbox =
    mounted && lightboxOpen
      ? createPortal(
          <div
            className="fixed inset-0 z-[300] flex flex-col text-white"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogLabelId}
          >
            <button
              type="button"
              aria-label="Close gallery"
              className="absolute inset-0 bg-black/82 backdrop-blur-[2px] transition-opacity"
              onClick={closeLightbox}
            />

            <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
              <div className="flex shrink-0 items-center justify-between gap-3 px-3 pt-3 md:px-4">
                <p id={dialogLabelId} className="min-w-0 truncate text-sm font-medium text-white/90 md:text-base">
                  {title}
                </p>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeLightbox}
                  className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-2 md:px-4">
                {n > 1 ? (
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous photo"
                    className="absolute left-1 z-[2] flex h-12 w-12 items-center justify-center border border-white/15 bg-black/50 text-white shadow-lg transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:left-3 md:h-14 md:w-14"
                  >
                    <ChevronLeft className="h-7 w-7 md:h-8 md:w-8" aria-hidden />
                  </button>
                ) : null}
                {n > 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next photo"
                    className="absolute right-1 z-[2] flex h-12 w-12 items-center justify-center border border-white/15 bg-black/50 text-white shadow-lg transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:right-3 md:h-14 md:w-14"
                  >
                    <ChevronRight className="h-7 w-7 md:h-8 md:w-8" aria-hidden />
                  </button>
                ) : null}

                <div
                  className="relative z-[1] flex h-full max-h-[min(72vh,720px)] w-full max-w-6xl touch-manipulation select-none items-center justify-center px-10 md:px-16"
                  onPointerDown={onLightboxPointerDown}
                  onPointerUp={onLightboxPointerUp}
                  onPointerCancel={onLightboxPointerUp}
                >
                  {photos.map((photo, i) => (
                    <div
                      key={`lb-${photo.id}`}
                      className={cn(
                        "absolute inset-0 flex items-center justify-center px-1",
                        transitionClass,
                        i === index ? "z-[1] opacity-100" : "z-0 pointer-events-none opacity-0",
                      )}
                    >
                      <PhotoWithStatus
                        photo={photo}
                        alt={photo.alt || `${title} — photo ${i + 1} of ${n}`}
                        className="max-h-full max-w-full rounded-none bg-black/20"
                        imgClassName="max-h-[min(72vh,720px)] max-w-full object-contain"
                        sizes="(max-width: 768px) 100vw, 1152px"
                        priority={i === index}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {n > 1 ? (
                <div className="relative z-[1] shrink-0 border-t border-white/10 bg-black/55 px-3 py-3 backdrop-blur-sm md:px-4">
                  <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-eyebrow text-white/55">
                    All photos · tap to jump
                  </p>
                  <div
                    ref={thumbStripRef}
                    className="flex max-w-full gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {photos.map((photo, i) => (
                      <button
                        key={`thumb-${photo.id}`}
                        type="button"
                        data-thumb-index={i}
                        onClick={() => setIndex(i)}
                        aria-label={`Show photo ${i + 1}`}
                        aria-current={i === index ? "true" : undefined}
                        className={cn(
                          "relative h-16 w-16 shrink-0 overflow-hidden border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                          i === index ? "border-white" : "border-transparent opacity-70 hover:opacity-100",
                        )}
                      >
                        <PhotoWithStatus
                          photo={photo}
                          alt={photo.alt ? `${photo.alt} (thumbnail)` : `Thumbnail ${i + 1}`}
                          variant="thumb"
                          className="h-full w-full"
                          imgClassName="h-full w-full object-cover"
                          sizes="64px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className={cn("flex w-full flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-3", className)}>
        <div className="min-w-0 flex-1">
          <div
            role="button"
            tabIndex={0}
            className={cn(
              "group relative block w-full cursor-zoom-in overflow-hidden border border-border bg-muted text-left touch-manipulation select-none touch-pan-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "aspect-[4/3]",
            )}
            onClick={onGalleryActivate}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onGalleryActivate();
              }
            }}
            aria-label={`Open fullscreen photos for ${title}. ${n > 1 ? "Swipe or use arrows in fullscreen to browse." : ""}`}
          >
            <div
              className="relative h-full w-full"
              onPointerDown={(e) => {
                e.stopPropagation();
                onPointerDown(e);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                endPointerDrag(e);
              }}
              onPointerCancel={(e) => {
                e.stopPropagation();
                endPointerDrag(e);
              }}
              onMouseEnter={() => {
                pointerInsideRef.current = true;
                startHoverTimer();
              }}
              onMouseLeave={() => {
                pointerInsideRef.current = false;
                clearHoverTimer();
              }}
              aria-hidden
            >
              {photos.map((photo, i) => (
                <div
                  key={photo.id}
                  className={cn(
                    "absolute inset-0 transition-opacity ease-out",
                    transitionClass,
                    i === index ? "z-[1] opacity-100" : "z-0 opacity-0",
                  )}
                >
                  <PhotoWithStatus
                    photo={photo}
                    alt={photo.alt || title}
                    className="h-full w-full"
                    imgClassName="pointer-events-none h-full w-full object-cover"
                    sizes="(max-width: 768px) 100vw, 896px"
                    priority={i === 0}
                  />
                </div>
              ))}

              <span className="pointer-events-none absolute inset-0 z-[2] bg-black/0 transition-colors group-hover:bg-black/10 group-focus-visible:bg-black/10" />

              <span className="pointer-events-none absolute bottom-3 left-3 z-[3] rounded-none border border-white/20 bg-black/55 px-2 py-1 text-[10px] font-medium uppercase tracking-eyebrow text-white/90 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:text-[11px]">
                View fullscreen
              </span>

              {n > 1 ? (
                <div
                  className="pointer-events-none absolute bottom-3 left-1/2 z-[3] flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/35 px-2.5 py-1.5 backdrop-blur-[2px]"
                  aria-hidden
                >
                  {photos.map((photo, i) => (
                    <span
                      key={`${photo.id}-dot-${i}`}
                      className={cn(
                        "h-1 rounded-full transition-all duration-300 ease-out",
                        i === index ? "w-3 bg-white" : "w-1 bg-white/45",
                      )}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {extraPreviewCount > 0 ? (
          <div className="flex shrink-0 flex-row gap-2 lg:h-full lg:w-[5.75rem] lg:min-h-0 lg:flex-col">
            {previewIndices.map((photoIdx) => {
              const photo = photos[photoIdx]!;
              return (
                <button
                  key={`preview-${photo.id}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(photoIdx);
                  }}
                  aria-label={`Show photo ${photoIdx + 1} of ${n}`}
                  className={cn(
                    "relative aspect-[4/3] min-h-0 min-w-0 flex-1 overflow-hidden border border-border bg-muted text-left opacity-90 transition hover:border-foreground/30 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:aspect-auto lg:h-0 lg:w-full lg:flex-1",
                  )}
                >
                  <PhotoWithStatus
                    photo={photo}
                    alt={photo.alt ? `${photo.alt} (preview)` : `${title} — preview ${photoIdx + 1}`}
                    variant="thumb"
                    className="h-full w-full"
                    imgClassName="h-full w-full object-cover"
                    sizes="(max-width: 1023px) 33vw, 92px"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {lightbox}
    </>
  );
}
