"use client";

import { useEffect, useState } from "react";
import { WORDS, shuffle } from "@/lib/data";
import { centerOf } from "@/lib/fx";
import { useFx } from "../Fx";
import type { GameProps } from "./types";

type Item = { word: string; emoji: string };

export default function Palabras({ onFinish, onStatus }: GameProps) {
  const { celebrate, speak } = useFx();
  const [round] = useState<{ words: Item[]; images: Item[] }>(() => {
    const picked = shuffle(WORDS).slice(0, 6);
    return { words: shuffle(picked), images: shuffle(picked) };
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [solved, setSolved] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [shake, setShake] = useState<string | null>(null);

  useEffect(() => onStatus(null), [onStatus]);

  const pickWord = (word: string) => {
    if (solved.includes(word)) return;
    setSelected(word);
    speak(word);
  };

  const pickImage = (word: string, el: Element) => {
    if (solved.includes(word) || !selected) return;
    if (word === selected) {
      const nextSolved = [...solved, word];
      setSolved(nextSolved);
      setSelected(null);
      celebrate(false, centerOf(el));
      if (nextSolved.length === round.words.length) {
        setTimeout(() => onFinish(nextSolved.length - mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1), 400);
      }
      return;
    }
    const nextMistakes = mistakes + 1;
    setMistakes(nextMistakes);
    setShake(word);
    setTimeout(() => setShake(null), 350);
  };

  return (
    <>
      <p className="hint">Toca una palabra para escucharla, luego toca su dibujo.</p>
      <div className="cols">
        <div className="col">
          {round.words.map((item) => (
            <button
              key={item.word}
              type="button"
              className={`tile${selected === item.word ? " selected" : ""}${
                solved.includes(item.word) ? " matched" : ""
              }`}
              onClick={() => pickWord(item.word)}
            >
              {item.word}
            </button>
          ))}
        </div>
        <div className="col">
          {round.images.map((item) => (
            <button
              key={item.word}
              type="button"
              className={`tile${solved.includes(item.word) ? " matched" : ""}${
                shake === item.word ? " shake" : ""
              }`}
              onClick={(e) => pickImage(item.word, e.currentTarget)}
            >
              <span className="emoji">{item.emoji}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
