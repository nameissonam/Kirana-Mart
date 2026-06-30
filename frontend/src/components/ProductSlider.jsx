import { useRef } from "react";

export default function ProductSlider({ children, ariaLabel = "Products" }) {
  const sliderRef = useRef(null);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const dragDistance = useRef(0);
  const isDragging = useRef(false);

  const handleWheel = (event) => {
    const slider = sliderRef.current;
    if (!slider || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    slider.scrollBy({ left: event.deltaY, behavior: "smooth" });
  };

  const handlePointerDown = (event) => {
    if (event.pointerType !== "mouse") return;
    if (event.target.closest("a, button, input, select, textarea, label")) return;
    const slider = sliderRef.current;
    if (!slider) return;
    isDragging.current = true;
    dragDistance.current = 0;
    dragStartX.current = event.clientX;
    dragStartScroll.current = slider.scrollLeft;
    slider.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging.current || event.pointerType !== "mouse") return;
    const distance = event.clientX - dragStartX.current;
    dragDistance.current = Math.abs(distance);
    sliderRef.current.scrollLeft = dragStartScroll.current - distance;
  };

  const stopDragging = () => {
    isDragging.current = false;
  };

  return (
    <div className="group/slider relative" aria-label={ariaLabel}>
      <div
        ref={sliderRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerLeave={stopDragging}
        className="flex cursor-grab snap-x gap-4 overflow-x-auto scroll-smooth pb-3 active:cursor-grabbing sm:gap-5"
      >
        {children}
      </div>
    </div>
  );
}
