"use client";

import { useEffect, useRef, useState } from "react";
import { MEMORY_LEVELS, SYMBOLS, shuffle } from "@/lib/data";
import { centerOf } from "@/lib/fx";
import { useFx } from "../Fx";
import type { GameProps } from "./types";

type Card = { symbol: string; flipped: boolean; matched: boolean };
type Game = { level: number; cards: Card[]; mismatches: number };

const buildLevel = (level: number): Card[] => {
  if (level >= MEMORY_LEVELS.length) return [];
  const symbols = shuffle(SYMBOLS).slice(0, MEMORY_LEVELS[level]);
  return shuffle([...symbols, ...symbols]).map((symbol) => ({
    symbol,
    flipped: false,
    matched: false,
  }));
};

const startGame = (level = 0): Game => ({ level, cards: buildLevel(level), mismatches: 0 });

export default function Memoria({ onFinish, onStatus }: GameProps) {
  const { celebrate } = useFx();
  const [game, setGame] = useState<Game>(startGame);
  const [shake, setShake] = useState<number | null>(null);
  const lock = useRef(false);
  const flipped = useRef<number[]>([]);

  const { level, cards, mismatches } = game;

  useEffect(() => onStatus(`Nivel ${level + 1}/${MEMORY_LEVELS.length}`), [level, onStatus]);

  useEffect(() => {
    if (level >= MEMORY_LEVELS.length) {
      onFinish(mismatches <= 4 ? 3 : mismatches <= 9 ? 2 : 1);
    }
  }, [level, mismatches, onFinish]);

  const flip = (idx: number, el: Element) => {
    if (lock.current) return;
    const card = cards[idx];
    if (card.flipped || card.matched) return;

    const pair = [...flipped.current, idx];
    flipped.current = pair;
    setGame((g) => ({
      ...g,
      cards: g.cards.map((c, i) => (i === idx ? { ...c, flipped: true } : c)),
    }));

    if (pair.length < 2) return;

    const [a, b] = pair;
    const matched = cards[a].symbol === cards[b].symbol;
    lock.current = true;

    if (matched) {
      const solved = cards.every((c, i) => c.matched || i === a || i === b);
      setGame((g) => ({
        ...g,
        cards: g.cards.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)),
      }));
      flipped.current = [];
      lock.current = false;
      celebrate(false, centerOf(el));
      if (solved) {
        setTimeout(() => setGame((g) => startGame(Math.min(g.level + 1, MEMORY_LEVELS.length))), 500);
      }
      return;
    }

    setShake(b);
    setTimeout(() => setShake(null), 350);
    setGame((g) => ({ ...g, mismatches: g.mismatches + 1 }));
    setTimeout(() => {
      setGame((g) => ({
        ...g,
        cards: g.cards.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)),
      }));
      flipped.current = [];
      lock.current = false;
    }, 800);
  };

  if (level >= MEMORY_LEVELS.length) return null;

  return (
    <>
      <p className="hint">
        Nivel {level + 1} — encuentra las parejas
      </p>
      <div className="mem-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {cards.map((card, idx) => (
          <button
            key={idx}
            type="button"
            className={`mem-card${card.flipped ? " flipped" : ""}${card.matched ? " matched" : ""}${
              shake === idx ? " shake" : ""
            }`}
            onClick={(e) => flip(idx, e.currentTarget)}
          >
            {card.flipped || card.matched ? card.symbol : "❔"}
          </button>
        ))}
      </div>
    </>
  );
}
