import React, { useState, useEffect, useRef } from "react";

const HoverCarousel = ({ images, isHovered }) => {
  console.log(images, isHovered);

  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const startCarousel = () => {
    stopCarousel();
    intervalRef.current = setInterval(nextImage, 800);
  };

  const stopCarousel = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isHovered && images?.length > 0) {
      startCarousel();
    } else {
      stopCarousel();
      setCurrentIndex(0);
    }
    return () => stopCarousel();
  }, [isHovered, images]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="h-60 w-60 relative z-50">
      {/* Main carousel container */}
      <div className="relative  w-full h-full rounded-lg overflow-hidden shadow-lg bg-gray-100">
        {/* Image container */}
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Carousel image ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        {/* Dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-white scale-125"
                    : "bg-white bg-opacity-50 scale-75"
                }`}
              />
            ))}
          </div>
        )}

        {/* Image count overlay */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          {currentIndex + 1}/{images.length}
        </div>
      </div>
    </div>
  );
};

export default HoverCarousel;
