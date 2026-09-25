"use client";

import IslaEscena from "./IslaEscena";
import Sprite from "./Sprite";
import { GUIDE } from "@/lib/islands";
import { ISLANDS, type IslandKey } from "@/lib/data";
import type { Stars } from "@/lib/progress";

export default function Map({
  stars,
  onPick,
}: {
  stars: Stars;
  onPick: (key: IslandKey) => void;
}) {
  return (
    <div className="map-layer">
      <header className="hud-title">
        <strong>CHECCITO</strong>
        <span>Formación en ciberseguridad</span>
      </header>

      {ISLANDS.map((island) => (
        <IslaEscena
          key={island.key}
          island={island}
          stars={stars[island.key] ?? 0}
          onPick={() => onPick(island.key)}
        />
      ))}

      <div className="guide">
        <Sprite
          className="guide-sprite"
          src={GUIDE.src}
          frames={GUIDE.frames}
          fps={GUIDE.fps}
          width={GUIDE.frameW * GUIDE.scale}
          height={GUIDE.frameH * GUIDE.scale}
        />
        <p className="guide-text">
          <strong>Soy Coco</strong>
          <span>Elige una isla para empezar el entrenamiento.</span>
        </p>
      </div>
    </div>
  );
}
