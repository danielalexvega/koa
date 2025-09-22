import React from "react";
import { Link } from "react-router-dom";

interface CampGroundCTABannerProps {
  bookNowCtaBackgroundImage?: string;
  bookNowCtaBackgroundVideoLink?: string;
  bookNowCtaText?: string;
  campgroundName?: string;
  bookingLink?: string;
}

const CampGroundCTABanner: React.FC<CampGroundCTABannerProps> = ({
  bookNowCtaBackgroundImage,
  bookNowCtaBackgroundVideoLink,
  bookNowCtaText,
  campgroundName,
  bookingLink = "/",
}) => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Video */}
      {bookNowCtaBackgroundVideoLink && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={bookNowCtaBackgroundVideoLink} type="video/mp4" />
        </video>
      )}

      {/* Background Image (only if no video) */}
      {!bookNowCtaBackgroundVideoLink && bookNowCtaBackgroundImage && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${bookNowCtaBackgroundImage})`,
          }}
        />
      )}

      {/* White background fallback */}
      {!bookNowCtaBackgroundVideoLink && !bookNowCtaBackgroundImage && (
        <div className="absolute inset-0 w-full h-full bg-white" />
      )}

      {/* Dark overlay for better text readability */}
      {(bookNowCtaBackgroundVideoLink || bookNowCtaBackgroundImage) && (
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
        <div className="text-center max-w-4xl">
          {/* KOA Logo */}
          <div className="mb-8">
            <img
              src="/koa-logo.png"
              alt="KOA Logo"
              className="h-20 w-auto mx-auto"
            />
          </div>

          {/* Campground Name */}
          {campgroundName && (
            <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
              {campgroundName.toUpperCase()}
            </h1>
          )}

          {/* CTA Text */}
          {bookNowCtaText && (
            <p className="text-white text-lg md:text-xl lg:text-2xl mb-8 leading-relaxed drop-shadow-lg max-w-3xl mx-auto">
              {bookNowCtaText}
            </p>
          )}

          {/* BOOK NOW Button */}
          <Link
            to={bookingLink}
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 text-lg rounded-lg transition-colors duration-200 shadow-lg"
          >
            BOOK NOW
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampGroundCTABanner;
