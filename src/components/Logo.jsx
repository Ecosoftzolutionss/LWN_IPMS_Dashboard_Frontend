import React from 'react';

/**
 * LEEWON logo as a vector (SVG) - stays sharp at any size / on any HD or 4K screen.
 * It is a redraw of the attached logo. To use your official artwork, replace the
 * <ellipse> and <path> below with the paths from your original .svg file.
 */
export default function Logo({ height = 76 }) {
  return (
    <svg
      viewBox="0 0 200 120"
      height={height}
      width={(height * 200) / 120}
      role="img"
      aria-label="LEEWON logo"
      className="leewon-logo"
    >
      <ellipse cx="100" cy="60" rx="98" ry="58" fill="#0A4FA3" />
      <path
        fill="#FFFFFF"
        d="M38 30 H72 L84 70 L100 38 L116 70 L128 30 H162 L136 92 H112 L100 68 L88 92 H64 Z"
      />
    </svg>
  );
}
