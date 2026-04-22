"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!images.length || !listRef.current) return
    const container = listRef.current
    const items = Array.from(
      container.querySelectorAll<HTMLElement>("[data-img-index]")
    )
    if (!items.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) {
          const idx = Number(
            (visible.target as HTMLElement).dataset.imgIndex ?? 0
          )
          setActiveIndex(idx)
        }
      },
      { threshold: [0.5, 0.75] }
    )

    items.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [images.length])

  const scrollToIndex = (i: number) => {
    if (!listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-img-index="${i}"]`
    )
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="flex items-start gap-6 relative">
      {/* Vertical thumbnail rail (desktop only, when >1 image) */}
      {images.length > 1 && (
        <div className="hidden small:flex flex-col gap-2 sticky top-[88px] flex-shrink-0">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={activeIndex === index}
              className="relative w-[68px] h-[80px] rounded-[10px] overflow-hidden border transition-all"
              style={{
                borderColor:
                  activeIndex === index
                    ? "#C8702A"
                    : "rgba(44,24,16,0.12)",
                boxShadow:
                  activeIndex === index
                    ? "0 0 0 3px rgba(200,112,42,0.15)"
                    : "none",
                opacity: activeIndex === index ? 1 : 0.7,
              }}
            >
              {image.url && (
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="68px"
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main images */}
      <div className="flex flex-col flex-1 gap-y-4 relative" ref={listRef}>
        {images.length > 1 && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark/80 text-background backdrop-blur-md font-sans text-[11px] font-semibold">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {images.map((image, index) => (
          <div
            key={image.id}
            data-img-index={index}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-[14px] bg-ui-bg-subtle"
            id={image.id}
          >
            {!!image.url && (
              <Image
                src={image.url}
                priority={index <= 1}
                className="absolute inset-0"
                alt={`Product image ${index + 1}`}
                fill
                sizes="(max-width: 576px) 100vw, (max-width: 992px) 60vw, 700px"
                style={{ objectFit: "cover" }}
              />
            )}
            {/* "More photos" hint on the first image */}
            {index === 0 && images.length > 1 && (
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md text-dark font-sans text-[11px] font-semibold shadow-[0_6px_20px_rgba(44,24,16,0.08)] pointer-events-none"
                style={{ animation: "gb-bounce-y 1.8s ease-in-out infinite" }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                </svg>
                {images.length - 1} more {images.length - 1 === 1 ? "photo" : "photos"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageGallery
