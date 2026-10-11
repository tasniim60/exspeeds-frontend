"use client";

import { useEffect, useRef, useState } from "react";

interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  className?: string;
  delay?: number; // seconds
  decimalPlaces?: number;
}

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className = "",
  decimalPlaces = 0,
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState<number>(direction === "down" ? value : 0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    const duration = 1200; // ms
    const delayMs = delay * 1000;

    const timeoutId = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out expo curve for smooth deceleration
        const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        if (direction === "up") {
          setDisplayValue(Number((easeOut * value).toFixed(decimalPlaces)));
        } else {
          setDisplayValue(Number((value - easeOut * value).toFixed(decimalPlaces)));
        }

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [value, direction, delay, decimalPlaces]);

  return (
    <span className={`inline-block tabular-nums tracking-normal ${className}`}>
      {decimalPlaces > 0 ? displayValue.toFixed(decimalPlaces) : Math.round(displayValue)}
    </span>
  );
}

