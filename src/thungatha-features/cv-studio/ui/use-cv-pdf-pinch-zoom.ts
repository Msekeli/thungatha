"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { calculatePinchZoom } from "./cv-pdf-pinch-zoom";

type PointerPosition = { x: number; y: number };
type PinchStart = { distance: number; zoom: number };

export function useCvPdfPinchZoom(
  zoom: number,
  setZoom: (zoom: number | ((current: number) => number)) => void,
) {
  const pointersRef = useRef(new Map<number, PointerPosition>());
  const pinchStartRef = useRef<PinchStart | null>(null);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch") return;
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size === 2) {
      const [first, second] = Array.from(pointersRef.current.values());
      pinchStartRef.current = {
        distance: Math.hypot(second.x - first.x, second.y - first.y),
        zoom,
      };
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const pinchStart = pinchStartRef.current;
    if (!pinchStart || pointersRef.current.size !== 2) return;

    const [first, second] = Array.from(pointersRef.current.values());
    const distance = Math.hypot(second.x - first.x, second.y - first.y);
    setZoom(calculatePinchZoom(pinchStart.zoom, pinchStart.distance, distance));
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) pinchStartRef.current = null;
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
  };
}
