'use client';
import { useEffect, useRef, useState } from 'react';

export function AnimateIn({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'scale' | 'none';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const from =
    direction === 'up' ? 'translateY(28px)' :
    direction === 'left' ? 'translateX(-28px)' :
    direction === 'right' ? 'translateX(28px)' :
    direction === 'scale' ? 'scale(0.95) translateY(10px)' : 'none';

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : from,
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function CountUp({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || on) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [on]);

  useEffect(() => {
    if (!on) return;
    const t0 = Date.now();
    const dur = 1800;
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 4)) * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [on, end]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}
