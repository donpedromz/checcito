"use client";

import { useState, type ReactNode } from "react";
import type { Metric } from "@/lib/tutor";

export function Dots({ total, current }: { total: number; current: number }) {
  return (
    <p className="lab-dots" aria-label={`Paso ${current} de ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < current ? "on" : ""}>
          ■
        </span>
      ))}
    </p>
  );
}

export function Brief({
  title,
  time,
  points,
  startLabel = "Empezar lab",
  onStart,
}: {
  title: string;
  time: string;
  points: string[];
  startLabel?: string;
  onStart: () => void;
}) {
  return (
    <div className="lab-card">
      <p className="lab-kicker">
        Guía rápida · {time} · Coco-IA, tu tutor
      </p>
      <h3>{title}</h3>
      <ul>
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={onStart}>
          {startLabel}
        </button>
      </div>
    </div>
  );
}

export function Socratic({
  ask,
  hint,
  actionLabel = "Entendido, sigo",
  onNext,
}: {
  ask: string;
  hint: string;
  actionLabel?: string;
  onNext: () => void;
}) {
  const [showHint, setShowHint] = useState(false);
  return (
    <div className="lab-card tutor">
      <p className="lab-kicker">Coco-IA · pregunta, no regaña</p>
      <p className="tutor-ask">{ask}</p>
      {!showHint ? (
        <button type="button" className="btn btn-ghost" onClick={() => setShowHint(true)}>
          Dame una pista
        </button>
      ) : (
        <p className="tutor-hint">Pista: {hint}</p>
      )}
      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={onNext}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

export function ReportCard({
  title,
  rows,
  stars,
  verdict,
  onDone,
}: {
  title: string;
  rows: Metric[];
  stars: number;
  verdict: ReactNode;
  onDone: () => void;
}) {
  return (
    <div className="lab-card">
      <p className="lab-kicker">{title}</p>
      <div className="report-stars" aria-label={`${stars} de 3 estrellas`}>
        {[1, 2, 3].map((s) => (
          <span key={s} className={s <= stars ? "star-on" : "star-off"}>
            ★
          </span>
        ))}
      </div>
      <dl className="report-rows">
        {rows.map((r) => (
          <div key={r.label}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
      <div className="verdict">{verdict}</div>
      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={onDone}>
          Volver al mapa
        </button>
      </div>
    </div>
  );
}
