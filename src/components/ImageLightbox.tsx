import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  activeIndex: number;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  onChange: (index: number) => void;
}

export default function ImageLightbox({
  images,
  activeIndex,
  productName,
  isOpen,
  onClose,
  onChange,
}: ImageLightboxProps) {
  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      onChange(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
    },
    [activeIndex, images.length, onChange]
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      onChange(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
    },
    [activeIndex, images.length, onChange]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-deep-brown/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} gallery`}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close gallery"
        className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/10 text-cream hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={handlePrev}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 text-cream hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <img
        src={images[activeIndex]}
        alt={`${productName} photo ${activeIndex + 1}`}
        className="max-h-[85vh] max-w-[90vw] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          aria-label="Next image"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 text-cream hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onChange(i);
              }}
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === activeIndex ? 'true' : undefined}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === activeIndex ? 'bg-amber' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
