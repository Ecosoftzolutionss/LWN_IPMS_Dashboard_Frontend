import React, { useLayoutEffect, useRef } from 'react';

/**
 * Text that shrinks (never grows past `max`) until it fits its parent box.
 * Keeps long part names inside the blue value boxes.
 */
export default function FitText({ children, max = 90, min = 20, className = '' }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;

    const fit = () => {
      const cs = getComputedStyle(box);
      const availW = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const availH = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      let size = max;
      el.style.fontSize = `${size}px`;
      while (size > min && (el.scrollWidth > availW || el.scrollHeight > availH)) {
        size -= 2;
        el.style.fontSize = `${size}px`;
      }
    };

    fit();
    // fonts may finish loading after first paint
    if (document.fonts?.ready) document.fonts.ready.then(fit);
  }, [children, max, min]);

  return (
    <span ref={ref} className={`fit-text ${className}`}>
      {children}
    </span>
  );
}
