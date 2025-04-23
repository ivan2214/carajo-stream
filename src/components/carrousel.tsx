import { useState } from "react";

export default function Carousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const lastIndex = images.length - 1;

  // Compute wrapped indices
  const prevIndex = current === 0 ? lastIndex : current - 1;
  const nextIndex = current === lastIndex ? 0 : current + 1;

  const goPrev = () => setCurrent(prevIndex);
  const goNext = () => setCurrent(nextIndex);

  return (
    <div className="flex w-full items-center justify-center md:max-w-screen-sm">
      {/* Previous preview */}

      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <img
        src={images[prevIndex]}
        alt="Previous"
        className="h-auto w-1/4 cursor-pointer object-cover opacity-50 transition-opacity hover:opacity-75"
        onClick={goPrev}
      />

      {/* Current image */}
      <img
        src={images[current]}
        alt="Current"
        className="mx-4 h-auto w-1/2 rounded-lg object-cover shadow-lg"
      />

      {/* Next preview */}

      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <img
        src={images[nextIndex]}
        alt="Next"
        className="h-auto w-1/4 cursor-pointer object-cover opacity-50 transition-opacity hover:opacity-75"
        onClick={goNext}
      />
    </div>
  );
}
