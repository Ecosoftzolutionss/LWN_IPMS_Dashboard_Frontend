import { useLayoutEffect } from 'react';

// usable width of an element's parent (inside its padding)
function availWidth(el) {
  const box = el.parentElement;
  const cs = getComputedStyle(box);
  return box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
}

/**
 * Shrinks text so that NOTHING is cut off ("..."), and keeps a whole column the
 * same size (every cell with the same data-fit key gets the same font size = the
 * largest size at which the longest value of that column still fits).
 *
 * Mark elements like:  <span data-fit="b2" data-max="28" data-min="14">text</span>
 */
export function useFitGroups(rootRef, deps) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const run = () => {
      const groups = new Map();
      root.querySelectorAll('[data-fit]').forEach((el) => {
        const key = el.dataset.fit;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(el);
      });

      groups.forEach((els) => {
        const max = Number(els[0].dataset.max) || 28;
        const min = Number(els[0].dataset.min) || 12;
        const setSize = (s) => els.forEach((e) => { e.style.fontSize = `${s}px`; });
        const allFit = () => els.every((e) => e.scrollWidth <= availWidth(e) + 0.5);

        let size = max;
        setSize(size);
        while (size > min && !allFit()) {
          size -= 1;
          setSize(size);
        }
      });
    };

    run();
    // web fonts can finish loading after the first paint
    if (document.fonts?.ready) document.fonts.ready.then(run);
    const t = setTimeout(run, 250); // safety pass after layout settles
    window.addEventListener('resize', run);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', run);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
