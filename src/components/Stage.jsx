import React, { useEffect, useState } from 'react';
import { DESIGN_W, DESIGN_H } from '../constants';

/**
 * Draws children on a fixed 1920x1080 stage and scales it to fit the window.
 * Fonts, boxes and spacing therefore look the same on every TV / monitor.
 */
export default function Stage({ children }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () =>
      setScale(Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  return (
    <div className="viewport">
      <div
        className="stage"
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
