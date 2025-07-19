// components/main/LenisProvider.tsx
"use client";

import { ReactNode, useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { useAnimationFrame } from "framer-motion";

export default function LenisProvider({ children }) {
  const lenisRef = useRef();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3), // cubic out
      smooth: true,
      smoothTouch: false,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Optional: Sync with Framer Motion if using scroll-based motion
  useAnimationFrame((t) => {
    lenisRef.current?.raf(t);
  });

  return <>{children}</>;
}
