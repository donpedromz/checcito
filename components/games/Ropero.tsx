"use client";

import { useEffect, useMemo, useState } from "react";
import { CLOTHES, CLOTH_DISTRACTORS, WEATHERS, shuffle } from "@/lib/data";
import { useDragDrop } from "@/lib/useDragDrop";
import { useFx } from "../Fx";
import type { GameProps } from "./types";

export default function Ropero({ onFinish, onStatus }: GameProps) {
  const { celebrate } = useFx();
  const [round, setRound] = useState(0);
  const [worn, setWorn] = useState<string[]>([]);
  const [shake, setShake] = useState<string | null>(null);

  const weather = WEATHERS[round];
  const pool = useMemo(
    () => (weather ? shuffle([...weather.need, ...shuffle(CLOTH_DISTRACTORS).slice(0, 2)]) : []),
    [weather],
  );

  useEffect(() => {
    if (weather) onStatus(`${round + 1} / ${WEATHERS.length}`);
  }, [weather, round, onStatus]);

  useEffect(() => {
    if (round >= WEATHERS.length) onFinish(3);
  }, [round, onFinish]);

  const { start, ghost, over } = useDragDrop<string>((key, { zone, at }) => {
    if (zone !== "avatar" || !weather) return;
    if (!weather.need.includes(key) || worn.includes(key)) {
      setShake(key);
      setTimeout(() => setShake(null), 350);
      return;
    }
    const next = [...worn, key];
    setWorn(next);
    celebrate(false, at);
    if (next.length === weather.need.length) {
      setTimeout(() => setRound((r) => r + 1), 500);
    }
  });

  if (!weather) return null;

  return (
    <>
      <div className="weather-banner">{weather.label}</div>
      <div
        className={`avatar-zone${over === "avatar" ? " drag-over" : ""}`}
        data-dropzone="avatar"
      >
        <div className="worn-items">
          {worn.map((key) => (
            <span key={key}>{CLOTHES[key]}</span>
          ))}
        </div>
        <div className="avatar">🧍</div>
      </div>
      <p className="hint">Arrastra la ropa correcta hasta tu amigo.</p>
      <div className="closet">
        {pool.map((key) => (
          <div
            key={key}
            className={`cloth${worn.includes(key) ? " used" : ""}${shake === key ? " shake" : ""}`}
            onPointerDown={(e) => start(key, CLOTHES[key], e)}
          >
            {CLOTHES[key]}
          </div>
        ))}
      </div>
      {ghost && (
        <div className="drag-ghost cloth" style={{ left: ghost.x, top: ghost.y }}>
          {ghost.emoji}
        </div>
      )}
    </>
  );
}
