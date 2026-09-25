"use client";

import { MasonSprite } from "mason-sprite/react";
import type { CSSProperties } from "react";

/**
 * Única puerta de entrada a la librería de sprites. Todo el pack usa hojas
 * horizontales de frame uniforme, así que solo necesitamos src + cols.
 *
 * ponytail: si mason-sprite molesta (es v0.x), se cambia este archivo por
 * keyframes `steps()` sobre background-position. Nada más lo importa.
 */
export default function Sprite({
  src,
  frames,
  fps = 10,
  width,
  height,
  className,
  style,
  loop = true,
  onComplete,
}: {
  src: string;
  frames: number;
  fps?: number;
  width: number | string;
  height: number | string;
  className?: string;
  style?: CSSProperties;
  loop?: boolean;
  onComplete?: () => void;
}) {
  return (
    <MasonSprite
      src={src}
      rows={1}
      cols={frames}
      fps={fps}
      loop={loop}
      onComplete={onComplete}
      width={width}
      height={height}
      className={className}
      style={style}
    />
  );
}
