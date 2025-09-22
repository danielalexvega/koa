import { FC, useState, useEffect } from "react";
import { HeroType } from "../model/types/hero-type.generated";
import { createPreviewLink } from "../utils/link";
import { useSearchParams } from "react-router";

interface HeroCarouselProps {
  heroes: HeroType[];
}

const HeroCarousel: FC<HeroCarouselProps> = ({ heroes }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  // Auto-advance slides every 20 seconds
  useEffect(() => {
    if (heroes.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroes.length);
    }, 20000);

    return () => clearInterval(interval);
  }, [heroes.length]);

  // Handle manual slide navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // const goToPrevious = () => {
  //   setCurrentSlide((prev) => (prev - 1 + heroes.length) % heroes.length);
  // };

  // const goToNext = () => {
  //   setCurrentSlide((prev) => (prev + 1) % heroes.length);
  // };

  if (!heroes || heroes.length === 0) {
    return null;
  }

  const currentHero = heroes[currentSlide];
  if (!currentHero) return null;
  
  const heroImage = currentHero.elements.hero_image.value?.[0];
  const headline = currentHero.elements.headline.value;
  const buttonLabel = currentHero.elements.button_label.value;
  const link = currentHero.elements.link.linkedItems?.[0];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Hero Image Background */}
      {heroImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage.url})`,
          }}
        />
      )}

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />


      {/* Content Overlay - Bottom Third */}
      <div className="absolute inset-0 flex items-end justify-center z-10 pb-32">
        <div className="text-center px-4 max-w-4xl">
          {/* Headline */}
          {headline && (
            <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight drop-shadow-lg">
              {headline}
            </h1>
          )}

          {/* Button */}
          {buttonLabel && link && (
            <a
              href={createPreviewLink((link.elements as { url?: { value?: string } }).url?.value || "#", isPreview)}
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 text-lg rounded-lg transition-colors duration-200 shadow-lg"
            >
              {buttonLabel}
            </a>
          )}
        </div>
      </div>

      {/* Slide Indicators - Bottom Left */}
      {heroes.length > 1 && (
        <div className="absolute bottom-6 left-6 z-10 flex space-x-2">
          {heroes.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? "bg-white"
                  : "bg-white bg-opacity-50 hover:bg-opacity-75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
