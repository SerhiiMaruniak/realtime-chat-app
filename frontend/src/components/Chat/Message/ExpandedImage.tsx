import { useEffect, useState, type WheelEvent } from "react";
import { useChatStore } from "../../../store/useChatStore";
import { Minus, Plus, RotateCcw, X } from "lucide-react";

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SCALE_STEP = 0.25;

const ExpandedImage = () => {
  const [scale, setScale] = useState(1);

  const { closeImage, selectedImage } = useChatStore();

  useEffect(() => {
    setScale(1);
  }, [selectedImage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeImage();
        return;
      }

      if (event.key === "+" || event.key === "=") {
        setScale((currentScale) => Math.min(MAX_SCALE, currentScale + SCALE_STEP));
      }

      if (event.key === "-") {
        setScale((currentScale) => Math.max(MIN_SCALE, currentScale - SCALE_STEP));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeImage]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    setScale((currentScale) => {
      const nextScale = currentScale + (event.deltaY < 0 ? SCALE_STEP : -SCALE_STEP);

      return Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.75)] backdrop-blur-sm flex justify-center items-center overflow-hidden"
      onClick={closeImage}
    >
      <button
        type="button"
        className="absolute z-50 top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-secondary_dark/90 text-input-text shadow-lg transition hover:bg-secondary_dark cursor-pointer"
        onClick={(event) => {
          event.stopPropagation();
          closeImage();
        }}
        aria-label="Close image viewer"
      >
        <X size={18} />
      </button>

      <div
        className="absolute z-50 bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-secondary_dark/90 px-3 py-2 text-input-text shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-spec-1-dark cursor-pointer"
          onClick={() =>
            setScale((currentScale) => Math.max(MIN_SCALE, currentScale - SCALE_STEP))
          }
          aria-label="Zoom out"
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-spec-1-dark cursor-pointer"
          onClick={() => setScale(1)}
          aria-label="Reset zoom"
        >
          <RotateCcw size={16} />
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-spec-1-dark cursor-pointer"
          onClick={() =>
            setScale((currentScale) => Math.min(MAX_SCALE, currentScale + SCALE_STEP))
          }
          aria-label="Zoom in"
        >
          <Plus size={16} />
        </button>
      </div>

      <img
        src={selectedImage ? selectedImage : ""}
        alt="expanded_message_image"
        draggable={false}
        className="z-40 max-w-[92vw] max-h-[86vh] animate-zoomin select-none object-contain shadow-2xl transition-transform duration-150 ease-out cursor-zoom-in"
        style={{ transform: `scale(${scale})` }}
        onClick={(event) => {
          event.stopPropagation();
          setScale((currentScale) => (currentScale === 1 ? 1.5 : 1));
        }}
        onWheel={handleWheel}
      />
    </div>
  );
};

export default ExpandedImage;
