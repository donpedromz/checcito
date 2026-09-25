"use client";

// next/image mete un wrapper y reoptimiza: aqui se necesita el control crudo
// del sprite (background-position por tile, object-fit y escala fija).
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import Sprite from "./Sprite";
import {
  ATLAS_SIZE,
  ISLAND_ART,
  ISLAND_H,
  ISLAND_W,
  SHADOW,
  SPLASH,
  TILEMAP,
  islandTiles,
  type Deco,
} from "@/lib/islands";
import type { Island } from "@/lib/data";

function DecoView({ deco, flip }: { deco: Deco; flip: boolean }) {
  const x = flip ? 100 - deco.x : deco.x;
  if (deco.kind === "sprite") {
    return (
      <Sprite
        className="deco"
        src={deco.src}
        frames={deco.frames}
        fps={deco.fps}
        width={deco.frameW * deco.scale}
        height={deco.frameH * deco.scale}
        style={{ left: `${x}%`, bottom: deco.bottom }}
      />
    );
  }
  return (
    <img
      className="deco"
      src={deco.src}
      alt=""
      aria-hidden
      style={{ left: `${x}%`, bottom: deco.bottom, width: deco.width }}
    />
  );
}

export default function IslaEscena({
  island,
  stars,
  onPick,
}: {
  island: Island;
  stars: number;
  onPick: () => void;
}) {
  const art = ISLAND_ART[island.key];
  const flip = art.shape === "b";
  const u = art.unit;
  const [splash, setSplash] = useState(0);

  return (
    <button
      type="button"
      className="island"
      style={island.pos}
      onClick={() => {
        setSplash((k) => k + 1);
        onPick();
      }}
      aria-label={`${island.name}. ${island.tag}. ${stars} de 3 estrellas`}
    >
      <span
        className="island-stage"
        style={{ width: ISLAND_W, height: ISLAND_H }}
      >
        <img className="island-shadow" src={SHADOW} alt="" aria-hidden />
        <span className={`island-land${flip ? " flip" : ""}`}>
          {islandTiles(art.shape).map((t, i) =>
            t.index == null ? (
              <span key={i} className="island-tile empty" />
            ) : (
              <span
                key={i}
                className="island-tile"
                style={{
                  backgroundImage: `url(${TILEMAP})`,
                  backgroundSize: ATLAS_SIZE,
                  backgroundPosition: `${t.x}px ${t.y}px`,
                }}
              />
            ),
          )}
        </span>
        {art.decos.map((d, i) => (
          <DecoView key={i} deco={d} flip={flip} />
        ))}
        <img
          className="island-building"
          src={art.building.src}
          alt=""
          aria-hidden
          style={{
            width: `${art.building.scale * 100}%`,
            left: flip ? "36%" : "4%",
          }}
        />
        <Sprite
          className="island-unit"
          src={u.src}
          frames={u.frames}
          fps={u.fps}
          width={u.frameW * u.scale}
          height={u.frameH * u.scale}
          style={{ left: flip ? "4%" : "58%" }}
        />
        <span className="island-foam" />
        {splash > 0 && (
          <Sprite
            key={splash}
            className="island-splash"
            src={SPLASH}
            frames={9}
            fps={18}
            width={192}
            height={192}
            loop={false}
            onComplete={() => setSplash(0)}
          />
        )}
      </span>

      <span className="island-label">
        <span className="island-tag">{island.tag}</span>
        <span className="island-name">{island.name}</span>
        <span className="island-stars" aria-hidden>
          {[1, 2, 3].map((s) => (
            <span key={s} className={s <= stars ? "star-on" : "star-off"}>
              ★
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}
