import type { ReactNode } from "react";

export type GameProps = {
  /** Report the earned stars and leave the island. */
  onFinish: (stars: number) => void;
  /** Render something in the game topbar (progress, hearts...). */
  onStatus: (node: ReactNode) => void;
};
