'use client';

import { useEffect, useRef, useState } from 'react';

/** Reproduit exactement le mécanisme .reveal / .reveal.in du prototype (IntersectionObserver, threshold .15) */
export function useReveal<T extends HTMLElement = HTMLDivElement>(startVisible = false) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(startVisible);

  useEffect(() => {
    if (startVisible) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [startVisible]);

  return { ref, className: `reveal${inView ? ' in' : ''}` };
}

/** Compteur animé — identique à la logique du prototype (requestAnimationFrame, pas de librairie) */
export function useCountUp(target: number, suffix = '') {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState('0');
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            let cur = 0;
            const step = Math.max(1, Math.round(target / 60));
            const tick = () => {
              cur += step;
              if (cur >= target) {
                setValue(target.toLocaleString('fr-FR') + suffix);
                return;
              }
              setValue(cur.toLocaleString('fr-FR') + suffix);
              requestAnimationFrame(tick);
            };
            tick();
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, suffix]);

  return { ref, value };
}
