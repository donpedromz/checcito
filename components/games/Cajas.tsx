"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, shuffle } from "@/lib/data";
import { useDragDrop } from "@/lib/useDragDrop";
import { useFx } from "../Fx";
import type { GameProps } from "./types";

type Item = { id: string; emoji: string; cat: string };

const ALL_ITEMS: Item[] = CATEGORIES.flatMap((c, ci) =>
  c.items.map((emoji, ii) => ({ id: `${ci}-${ii}`, emoji, cat: c.key })),
);

export default function Cajas({ onFinish, onStatus }: GameProps) {
  const { celebrate } = useFx();
  const [tray, setTray] = useState<Item[]>(() => shuffle(ALL_ITEMS));
  const [placed, setPlaced] = useState<Record<string, string[]>>({});
  const [shake, setShake] = useState<string | null>(null);

  const done = ALL_ITEMS.length - tray.length;
  useEffect(() => onStatus(`${done} / ${ALL_ITEMS.length}`), [done, onStatus]);

  const { start, ghost, over } = useDragDrop<Item>((item, { zone, at }) => {
    if (zone !== item.cat) {
      setShake(item.id);
      setTimeout(() => setShake(null), 350);
      return;
    }
    setPlaced((prev) => ({ ...prev, [item.cat]: [...(prev[item.cat] ?? []), item.emoji] }));
    setTray((prev) => prev.filter((i) => i.id !== item.id));
    celebrate(false, at);
    if (tray.length === 1) setTimeout(() => onFinish(3), 500);
  });

  return (
    <>
      <p className="hint">Arrastra cada cosa a su caja. Tómate tu tiempo.</p>
      <div className="boxes">
        {CATEGORIES.map((c) => (
          <div
            key={c.key}
            className={`box${over === c.key ? " drag-over" : ""}`}
            data-dropzone={c.key}
          >
            <span>{c.label}</span>
            <div className="placed">{placed[c.key]?.join(" ")}</div>
          </div>
        ))}
      </div>
      <p className="tray-title">Cosas para guardar</p>
      <div className="items-tray">
        {tray.map((item) => (
          <div
            key={item.id}
            className={`item-chip${shake === item.id ? " shake" : ""}`}
            onPointerDown={(e) => start(item, item.emoji, e)}
          >
            {item.emoji}
          </div>
        ))}
      </div>
      {ghost && (
        <div className="drag-ghost item-chip" style={{ left: ghost.x, top: ghost.y }}>
          {ghost.emoji}
        </div>
      )}
    </>
  );
}
