"use client";

import { useState, useEffect } from "react";

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="back-to-top-button"
      aria-label="Back to top"
    >
      <svg viewBox="0 0 384 512" className="svgIcon">
        <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"></path>
      </svg>

      <style jsx>{`
        .back-to-top-button {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: rgb(20, 20, 20);
          border: none;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0px 0px 0px 0.5px rgba(77, 212, 212, 0.4);
          cursor: pointer;
          transition-duration: 0.3s;
          overflow: hidden;
          z-index: 1000;
        }

        .svgIcon {
          width: 12px;
          transition-duration: 0.3s;
        }

        .svgIcon path {
          fill: white;
        }

        .back-to-top-button:hover {
          width: 140px;
          border-radius: 50px;
          transition-duration: 0.3s;
          background-color: #193d3d;
          box-shadow: 0px 0px 0px 2px rgba(77, 212, 212, 0.6), 0px 0px 20px rgba(77, 212, 212, 0.4);
          align-items: center;
        }

        .back-to-top-button:hover .svgIcon {
          transition-duration: 0.3s;
          transform: translateY(-200%);
        }

        .back-to-top-button::before {
          position: absolute;
          bottom: -20px;
          content: "Back to Top";
          color: white;
          font-size: 0px;
        }

        .back-to-top-button:hover::before {
          font-size: 13px;
          opacity: 1;
          bottom: unset;
          transition-duration: 0.3s;
        }

        .back-to-top-button:active {
          transform: scale(0.95);
        }

        @media (max-width: 640px) {
          .back-to-top-button {
            bottom: 1rem;
            right: 1rem;
          }
        }
      `}</style>
    </button>
  );
}

