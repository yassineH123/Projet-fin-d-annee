import { useEffect, useRef } from 'react';

/**
 * Attaches an IntersectionObserver to a container ref.
 * Every child with [data-reveal] gets a staggered fade-in + translateY reveal
 * as it enters the viewport.
 *
 * Usage:
 *   const ref = useScrollReveal();
 *   <section ref={ref}>
 *     <div data-reveal>...</div>
 *     <div data-reveal>...</div>
 *   </section>
 *
 * Or use the <RevealSection> wrapper component for convenience.
 */
export function useScrollReveal({ threshold = 0.12, staggerMs = 100 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const targets = container.querySelectorAll('[data-reveal]');
    if (targets.length === 0) {
      // If no [data-reveal] children, reveal the container itself
      container.setAttribute('data-reveal-self', 'true');
    }

    const elements = targets.length > 0 ? targets : [container];

    elements.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${i * staggerMs}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${i * staggerMs}ms`;
      el.style.willChange = 'opacity, transform';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.unobserve(el);
        });
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [threshold, staggerMs]);

  return ref;
}

export default useScrollReveal;
