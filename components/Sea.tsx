"use client";

// Sprites pixelados con reflejo pintado: next/image no aporta nada y mete un wrapper.
/* eslint-disable @next/next/no-img-element */

import Sprite from "./Sprite";
import { SEA, WATER_TILE } from "@/lib/islands";

/** Mar permanente: fondo fijo detras de todas las pantallas. */
export default function Sea() {
  return (
    <div className="sea" aria-hidden>
      <div className="sea-water" style={{ backgroundImage: `url(${WATER_TILE})` }} />
      {SEA.clouds.map((c, i) => (
        <img
          key={i}
          className="sea-cloud"
          src={c.src}
          alt=""
          style={{
            top: c.top,
            width: 576 * c.scale,
            animationDuration: c.dur,
            animationDelay: c.delay,
          }}
        />
      ))}
      {SEA.rocks.map((r, i) => (
        <Sprite
          key={i}
          className="sea-rock"
          src={r.src}
          frames={16}
          fps={8}
          width={64}
          height={64}
          style={{ left: r.left, top: r.top }}
        />
      ))}
      <Sprite
        className="sea-duck"
        src={SEA.duck.src}
        frames={SEA.duck.frames}
        fps={SEA.duck.fps}
        width={SEA.duck.frameW * SEA.duck.scale}
        height={SEA.duck.frameH * SEA.duck.scale}
      />
    </div>
  );
}
