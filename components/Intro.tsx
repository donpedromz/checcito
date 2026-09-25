"use client";

import { useFx } from "./Fx";
import type { Island } from "@/lib/data";

export default function Intro({
  island,
  onBack,
  onPlay,
}: {
  island: Island;
  onBack: () => void;
  onPlay: () => void;
}) {
  const { speak } = useFx();

  return (
    <>
      <div className="topbar">
        <button type="button" className="back-btn" onClick={onBack}>
          &larr; Mapa
        </button>
        <span />
      </div>
      <div className="panel chec">
        <div className="icon-badge" data-team={island.key} aria-hidden>
          {island.tag.slice(0, 2).toUpperCase()}
        </div>
        <h2>{island.name}</h2>
        <p>{island.desc}</p>
        <div className="btn-row">
          <button type="button" className="btn btn-listen" onClick={() => speak(island.desc)}>
            ▶ Escuchar
          </button>
          <button type="button" className="btn btn-primary" onClick={onPlay}>
            ¡Entrar!
          </button>
        </div>
      </div>
    </>
  );
}
