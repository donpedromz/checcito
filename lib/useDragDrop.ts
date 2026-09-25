"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Point } from "./fx";

export type DropResult = { zone: string | null; at: Point };

/**
 * Pointer-based drag & drop. Dropzones opt in via `data-dropzone="<id>"`, which
 * keeps the hook free of per-zone React wiring. The dragged payload is handed
 * back to `onDrop` so callers don't need their own refs.
 */
export function useDragDrop<P>(onDrop: (payload: P, result: DropResult) => void) {
  const [ghost, setGhost] = useState<(Point & { emoji: string }) | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const onDropRef = useRef(onDrop);
  useEffect(() => {
    onDropRef.current = onDrop;
  }, [onDrop]);

  function start(payload: P, emoji: string, e: ReactPointerEvent) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX: startX, clientY: startY } = e;
    setGhost({ x: rect.left, y: rect.top, emoji });

    const zoneAt = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y);
      return el?.closest<HTMLElement>("[data-dropzone]")?.dataset.dropzone ?? null;
    };

    const move = (ev: PointerEvent) => {
      setGhost((g) =>
        g ? { ...g, x: rect.left + ev.clientX - startX, y: rect.top + ev.clientY - startY } : g,
      );
      setOver(zoneAt(ev.clientX, ev.clientY));
    };
    const up = (ev: PointerEvent) => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      setGhost(null);
      setOver(null);
      onDropRef.current(payload, {
        zone: zoneAt(ev.clientX, ev.clientY),
        at: { x: ev.clientX, y: ev.clientY },
      });
    };

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  }

  return { start, ghost, over };
}
