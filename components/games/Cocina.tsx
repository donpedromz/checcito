"use client";

import { useEffect, useState } from "react";
import { FOOD_DISTRACTORS, RECIPES, shuffle } from "@/lib/data";
import { centerOf } from "@/lib/fx";
import { useFx } from "../Fx";
import type { GameProps } from "./types";

type Chip = { id: number; emoji: string };
/** `null` means every recipe is done. */
type Recipe = { index: number; tray: Chip[]; used: number; hearts: number } | null;

const startRecipe = (index: number): Recipe => {
  if (index >= RECIPES.length) return null;
  const steps = RECIPES[index].steps;
  return {
    index,
    tray: shuffle([
      ...steps.map((emoji, i) => ({ id: i, emoji })),
      ...shuffle(FOOD_DISTRACTORS)
        .slice(0, 3)
        .map((emoji, i) => ({ id: steps.length + i, emoji })),
    ]),
    used: 0,
    hearts: 3,
  };
};

export default function Cocina({ onFinish, onStatus }: GameProps) {
  const { celebrate, toast } = useFx();
  const [recipe, setRecipe] = useState<Recipe>(() => startRecipe(0));
  const [shake, setShake] = useState<number | null>(null);

  useEffect(() => {
    onStatus(
      <span className="hearts">
        {[0, 1, 2].map((i) => (i < (recipe?.hearts ?? 0) ? "❤️" : "🤍"))}
      </span>,
    );
  }, [recipe?.hearts, onStatus]);

  useEffect(() => {
    if (recipe === null) onFinish(3);
  }, [recipe, onFinish]);

  if (!recipe) return null;

  const spec = RECIPES[recipe.index];

  const pick = (chip: Chip, el: Element) => {
    if (chip.emoji === spec.steps[recipe.used]) {
      celebrate(false, centerOf(el));
      const used = recipe.used + 1;
      if (used === spec.steps.length) {
        const next = recipe.index + 1;
        setTimeout(() => setRecipe(startRecipe(next)), 600);
      } else {
        setRecipe({ ...recipe, used });
      }
      return;
    }
    setShake(chip.id);
    setTimeout(() => setShake(null), 350);
    if (recipe.hearts - 1 <= 0) {
      setRecipe({ ...recipe, used: 0, hearts: 3 });
      toast("¡No te preocupes! Vuelve a intentarlo 💪");
    } else {
      setRecipe({ ...recipe, hearts: recipe.hearts - 1 });
    }
  };

  return (
    <>
      <div className="plate">
        <strong>{spec.name}</strong>
        <div className="recipe-track">
          {spec.steps.map((step, i) => (
            <div key={i} className={`slot${i < recipe.used ? " filled" : ""}`}>
              {i < recipe.used ? step : ""}
            </div>
          ))}
        </div>
      </div>
      <p className="tray-title">Toca los ingredientes en este orden</p>
      <div className="items-tray">
        {recipe.tray.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={`item-chip${shake === chip.id ? " shake" : ""}`}
            onClick={(e) => pick(chip, e.currentTarget)}
          >
            {chip.emoji}
          </button>
        ))}
      </div>
    </>
  );
}
