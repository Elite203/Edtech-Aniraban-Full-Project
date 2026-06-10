import React, { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
 import "./NotFound.css"

export default function NotFoundPage() {
  const notFoundRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth < 768) return;

      const container = notFoundRef.current;
      if (!container) return;

      const halfWidth = container.offsetWidth / 2;
      const halfHeight = container.offsetHeight / 2;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newX = (x - halfWidth) / 30;
      const newY = (y - halfHeight) / 30;

      const waves = container.querySelectorAll('[class*="wave-"]:not(.wave-message):not(.wave-island):not(.wave-boat)');
      waves.forEach((wave, index) => {
        wave.style.transition = "none";
        wave.style.transform = `translate3d(${index * newX}px, ${index * newY}px, 0)`;
      });
    };

    const handleMouseLeave = () => {
      const container = notFoundRef.current;
      if (!container) return;

      const waves = container.querySelectorAll('[class*="wave-"]:not(.wave-message):not(.wave-island):not(.wave-boat)');
      waves.forEach((wave) => {
        wave.style.transition = "all 0.7s";
        wave.style.transform = "translate(0px, 0px)";
      });

      setTimeout(() => {
        waves.forEach((wave) => {
          wave.style.transition = "";
        });
      }, 700);
    };

    const container = notFoundRef.current;
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="overflow-hidden o">
      <Helmet>
        <title>404 - Page Not Found | Anirbans Academy</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="not-found parallax " ref={notFoundRef}>
        <div className="sky-bg"></div>
        <div className="wave-7"></div>
        <div className="wave-6"></div>

        <Link className="wave-island" to="/">
          <img
            src="http://res.cloudinary.com/andrewhani/image/upload/v1524501929/404/island.svg"
            alt="Island"
          />
        </Link>

        <div className="wave-5"></div>

        <div className="wave-lost wrp">
          <span>4</span>
          <span>0</span>
          <span>4</span>
        </div>

        <div className="wave-4"></div>

        <div className="wave-boat">
          <img
            className="boat"
            src="http://res.cloudinary.com/andrewhani/image/upload/v1524501894/404/boat.svg"
            alt="Boat"
          />
        </div>

        <div className="wave-3"></div>
        <div className="wave-2"></div>
        <div className="wave-1"></div>

        <div className="wave-message">
          <p>You're lost</p>
          <p>Click on the island to return</p>
        </div>
      </div>
    </div>
  );
}
