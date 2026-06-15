/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useId, useState } from "react";

interface DynamicLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  darkMode?: boolean;
}

export function DynamicLogo({
  className = "",
  size = "md",
  darkMode = true,
}: DynamicLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const uid = useId().replace(/:/g, "");
  const emeraldIndigoGrad = `emeraldIndigoGrad-${uid}`;
  const eagleGrad = `eagleGrad-${uid}`;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const spinDuration = isHovered ? "4s" : "12s";
  const spinReverseDuration = isHovered ? "3s" : "8s";

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none rounded-lg focus-within:ring-2 focus-within:ring-primary-500/40 focus-within:ring-offset-2 focus-within:ring-offset-transparent ${sizeClasses[size]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      role="img"
      aria-label="RegTech AfCFTA"

    >
      <div
        className={`absolute inset-0 rounded-full blur-md opacity-40 transition-all duration-300 motion-safe:scale-125 motion-safe:duration-700 ${
          isHovered ? "motion-safe:scale-[1.4] opacity-60" : ""
        } ${
          darkMode
            ? "bg-gradient-to-tr from-primary-500/30 to-primary-400/30"
            : "bg-gradient-to-tr from-primary-400/20 to-primary-400/20"
        }`}
        aria-hidden
      />

      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={darkMode ? "#334155" : "#cbd5e1"}
          strokeWidth="1.5"
          strokeDasharray="6 20 12 10"
          className="logo-spin origin-center transition-all duration-300"
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            animationDuration: spinDuration,
          }}
        />

        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke={`url(#${emeraldIndigoGrad})`}
          strokeWidth="2"
          strokeDasharray="40 15 10 15"
          className="logo-spin-reverse origin-center"
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            animationDuration: spinReverseDuration,
          }}
        />

        <g
          className="transition-opacity duration-300"
          style={{ opacity: isHovered ? 0.95 : 0.6 }}
        >
          <path
            d="M 50,22 A 28,28 0 0,1 68,68"
            fill="none"
            stroke={darkMode ? "#10b981" : "#059669"}
            strokeWidth="1"
            strokeDasharray="4 4"
            className="motion-safe:animate-pulse"
          />
          <path
            d="M 22,50 A 28,28 0 0,0 78,50"
            fill="none"
            stroke={darkMode ? "#6366f1" : "#4f46e5"}
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <circle cx="50" cy="22" r="2.5" fill="#10b981" className="motion-safe:animate-ping" />
          <circle cx="68" cy="68" r="2.5" fill="#6366f1" />
          <circle cx="22" cy="50" r="2.5" fill="#10b981" />
          <circle cx="78" cy="50" r="2.5" fill="#6366f1" className="motion-safe:animate-ping" />
        </g>

        <g
          className="origin-center transition-transform duration-300 motion-safe:duration-500"
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            transform: isHovered ? "scale(1.1)" : "scale(1)",
          }}
        >
          <circle
            cx="50"
            cy="50"
            r="18"
            fill={darkMode ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)"}
            stroke={`url(#${emeraldIndigoGrad})`}
            strokeWidth="1.5"
          />

          <path
            d="M 38,52 C 34,44 42,44 47,47 C 49,48 50,49 50,49"
            fill="none"
            stroke={`url(#${eagleGrad})`}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 62,52 C 66,44 58,44 53,47 C 51,48 50,49 50,49"
            fill="none"
            stroke={`url(#${eagleGrad})`}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M 50,41 L 52,46 L 50,49 L 48,46 Z" fill={`url(#${eagleGrad})`} />
          <path
            d="M 33,50 Q 50,38 67,50"
            fill="none"
            stroke={darkMode ? "rgba(16, 185, 129, 0.3)" : "rgba(5, 150, 105, 0.25)"}
            strokeWidth="1"
          />
          <path
            d="M 33,50 Q 50,62 67,50"
            fill="none"
            stroke={darkMode ? "rgba(99, 102, 241, 0.3)" : "rgba(79, 70, 229, 0.25)"}
            strokeWidth="1"
          />
        </g>

        <defs>
          <linearGradient id={emeraldIndigoGrad} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id={eagleGrad} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
