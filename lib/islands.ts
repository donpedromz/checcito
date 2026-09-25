import type { IslandKey } from "./data";

/* ---------- ATLAS DE TERRENO ----------
 * Tilemap_color1.png = 9x6 tiles de 64px. El artista dibujo dos islas
 * canonicas (ver analisis del alfa): el bloque derecho flota sobre un
 * acantilado macizo, el izquierdo se estrecha hasta una punta de roca.
 *
 *   A "flotante con acantilado" (4x6):
 *     5  6  7  8    borde sup
 *    14 15 16 17    relleno
 *    23 24 25 26    relleno
 *    32 33 34 35    labio (franja rocosa colgando)
 *    41 42 43 44    roca
 *    50 51 52 53    roca base con espuma
 *
 *   B "roca alta" (4x6, · = celda vacia: se ve el agua):
 *     0  1  2  3
 *     9 10 11 12
 *    18 19 20 21
 *    27 28 29 30
 *    36  ·  · 39    esquinas diagonales
 *    45  ·  · 48    punta
 *
 * Las 5 paletas comparten la misma mascara alfa (0 px distintos), asi que
 * estos indices sirven para cualquier color.
 */
export const TILE = 64;
export const ATLAS_COLS = 9;
export const ATLAS_SIZE = `${TILE * ATLAS_COLS}px ${TILE * 6}px`;
export const TILEMAP = "/sprites/terrain/tileset/tilemap_color1.png";
export const SHADOW = "/sprites/terrain/tileset/shadow.png";
export const WATER_TILE = "/sprites/terrain/tileset/water-background-color.png";
export const SPLASH = "/sprites/particle-fx/water-splash.png";

export const GRID_COLS = 4;
export const GRID_ROWS = 6;
export const ISLAND_W = GRID_COLS * TILE; // 256
export const ISLAND_H = GRID_ROWS * TILE; // 384

export type IslandShape = "a" | "b";

const SHAPE_A: (number | null)[] = [
  5, 6, 7, 8,
  14, 15, 16, 17,
  23, 24, 25, 26,
  32, 33, 34, 35,
  41, 42, 43, 44,
  50, 51, 52, 53,
];

const SHAPE_B: (number | null)[] = [
  0, 1, 2, 3,
  9, 10, 11, 12,
  18, 19, 20, 21,
  27, 28, 29, 30,
  36, null, null, 39,
  45, null, null, 48,
];

export const islandTiles = (shape: IslandShape) =>
  (shape === "a" ? SHAPE_A : SHAPE_B).map((index) => ({
    index,
    x: index == null ? 0 : -(index % ATLAS_COLS) * TILE,
    y: index == null ? 0 : -Math.floor(index / ATLAS_COLS) * TILE,
  }));

export type TeamColor = "blue" | "red" | "yellow" | "purple" | "black";

export type Deco =
  | {
      kind: "sprite";
      src: string;
      frames: number;
      fps: number;
      frameW: number;
      frameH: number;
      scale: number;
      /** % desde la izquierda (se espeja con la forma B) */
      x: number;
      /** px logicos desde abajo de la caja de la isla */
      bottom: number;
      flip?: boolean;
    }
  | {
      kind: "img";
      src: string;
      /** px logicos de ancho (el alto se deriva) */
      width: number;
      x: number;
      bottom: number;
      flip?: boolean;
    };

export type IslandArt = {
  color: TeamColor;
  shape: IslandShape;
  building: { src: string; scale: number };
  unit: { src: string; frames: number; fps: number; scale: number; frameW: number; frameH: number };
  /** decorado propio: relieve e identidad de la isla */
  decos: Deco[];
};

const T = (d: string) => `/sprites/terrain/${d}`;
const U = (u: string) => `/sprites/units/${u}`;
const B = (b: string) => `/sprites/buildings/${b}`;

/** Todas las hojas del pack son de frame 192px de ancho; el lancer es el unico mas alto. */
const unit = (src: string, frames: number, fps: number, scale = 0.42, frameH = 192) => ({
  src,
  frames,
  fps,
  scale,
  frameW: 192,
  frameH,
});

/**
 * El color del equipo lo llevan el edificio y la unidad; la hierba se mantiene
 * neutra en las 5 islas para que el significado no dependa de un tono de verde.
 */
export const ISLAND_ART: Record<IslandKey, IslandArt> = {
  phishing: {
    color: "black",
    shape: "b",
    building: { src: B("black-buildings/archery.png"), scale: 0.5 },
    unit: unit(U("black-units/archer/archer_shoot.png"), 8, 9),
    decos: [
      { kind: "img", src: T("resources/wood/trees/stump-1.png"), width: 60, x: 66, bottom: 128 },
      { kind: "img", src: T("decorations/rocks/rock2.png"), width: 52, x: 8, bottom: 96 },
    ],
  },
  malware: {
    color: "red",
    shape: "a",
    building: { src: B("red-buildings/barracks.png"), scale: 0.5 },
    unit: unit(U("red-units/pawn/pawn_run-knife.png"), 6, 10),
    decos: [
      { kind: "sprite", src: "/sprites/particle-fx/fire_01.png", frames: 8, fps: 10, frameW: 64, frameH: 64, scale: 1, x: 12, bottom: 64 },
      { kind: "img", src: T("decorations/rocks/rock3.png"), width: 56, x: 74, bottom: 100 },
    ],
  },
  contrasenas: {
    color: "purple",
    shape: "a",
    building: { src: B("purple-buildings/monastery.png"), scale: 0.48 },
    unit: unit(U("purple-units/warrior/warrior_guard.png"), 6, 6),
    decos: [
      { kind: "img", src: T("resources/gold/gold-stones/gold-stone-2.png"), width: 56, x: 68, bottom: 128 },
      { kind: "sprite", src: T("decorations/bushes/bushe2.png"), frames: 8, fps: 5, frameW: 128, frameH: 128, scale: 0.5, x: 6, bottom: 128 },
    ],
  },
  dispositivos: {
    color: "yellow",
    shape: "b",
    building: { src: B("yellow-buildings/house1.png"), scale: 0.55 },
    unit: unit(U("yellow-units/pawn/pawn_interact-hammer.png"), 3, 4),
    decos: [
      { kind: "img", src: T("resources/tools/tool_01.png"), width: 44, x: 62, bottom: 132 },
      { kind: "img", src: T("resources/tools/tool_02.png"), width: 40, x: 76, bottom: 128 },
      { kind: "img", src: T("resources/wood/wood-resource/wood-resource.png"), width: 44, x: 10, bottom: 128 },
    ],
  },
  acceso: {
    color: "blue",
    shape: "a",
    building: { src: B("blue-buildings/castle.png"), scale: 0.42 },
    unit: unit(U("blue-units/lancer/lancer_idle.png"), 20, 8, 0.38, 320),
    decos: [
      { kind: "sprite", src: T("resources/meat/sheep/sheep_idle.png"), frames: 6, fps: 5, frameW: 128, frameH: 128, scale: 0.5, x: 64, bottom: 126 },
      { kind: "img", src: T("decorations/rocks/rock1.png"), width: 48, x: 8, bottom: 110 },
    ],
  },
};

/** Guia: un Pawn que hace de Coco. */
export const GUIDE = {
  src: U("blue-units/pawn/pawn_idle.png"),
  frames: 8,
  fps: 6,
  scale: 0.4,
  frameW: 192,
  frameH: 192,
};

/** Cielo y agua ambiente del mar permanente. */
export const SEA = {
  clouds: [
    { src: T("decorations/clouds/clouds_01.png"), scale: 0.45, top: "6%", dur: "52s", delay: "0s" },
    { src: T("decorations/clouds/clouds_03.png"), scale: 0.32, top: "30%", dur: "74s", delay: "-30s" },
    { src: T("decorations/clouds/clouds_07.png"), scale: 0.55, top: "64%", dur: "64s", delay: "-48s" },
  ],
  duck: { src: T("decorations/rubber-duck/rubber-duck.png"), frames: 3, fps: 3, frameW: 32, frameH: 32, scale: 1.6 },
  rocks: [
    { src: T("decorations/rocks-in-the-water/water-rocks_01.png"), left: "8%", top: "78%" },
    { src: T("decorations/rocks-in-the-water/water-rocks_02.png"), left: "88%", top: "30%" },
  ],
};
