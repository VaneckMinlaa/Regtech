/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";

interface DynamicLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  darkMode?: boolean;
}

const SIZE_CLASSES = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
} as const;

/** Primary palette fills for the stacked mark (matches public/logo.svg). */
function logoFills(darkMode: boolean) {
  return darkMode
    ? { back: "#6938ef", mid: "#7a5af8", front: "#bdb4fe" }
    : { back: "#5925dc", mid: "#7a5af8", front: "#9b8afb" };
}

export function DynamicLogo({
  className = "",
  size = "md",
  darkMode = true,
}: DynamicLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const fills = logoFills(darkMode);

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none rounded-lg focus-within:ring-2 focus-within:ring-primary-500/40 focus-within:ring-offset-2 focus-within:ring-offset-transparent ${SIZE_CLASSES[size]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      role="img"
      aria-label="RegTech"
    >
      <div
        className={`absolute inset-0 rounded-lg blur-md opacity-30 transition-all duration-300 motion-safe:duration-500 ${
          isHovered ? "motion-safe:scale-110 opacity-50" : ""
        } bg-linear-to-tr from-primary-600/40 to-primary-400/30`}
        aria-hidden
      />

      <svg
        viewBox="0 0 24 24"
        className={`w-full h-full relative z-10 transition-transform duration-300 motion-safe:duration-500 ${
          isHovered ? "motion-safe:scale-105" : ""
        }`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          points="20.39 18.24 20.39 8 11.52 2.89 11.52 7.55 16.37 10.32 16.35 15.91 20.39 18.24"
          fill={fills.back}
        />
        <polygon
          points="14.79 19.86 14.79 11.23 7.33 6.92 7.33 10.94 11.34 13.23 11.32 17.85 14.79 19.86"
          fill={fills.mid}
        />
        <polygon
          points="9.76 21.15 9.76 14.14 3.69 10.64 3.69 14 6.86 15.81 6.84 19.47 9.76 21.15"
          fill={fills.front}
        />
      </svg>
    </div>
  );
}
