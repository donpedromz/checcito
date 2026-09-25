export type IslandKey = "phishing" | "malware" | "contrasenas" | "dispositivos" | "acceso";

export type Island = {
  key: IslandKey;
  name: string;
  tag: string;
  desc: string;
  pos: { top: string; left: string };
};

export const ISLANDS: Island[] = [
  {
    key: "phishing",
    name: "Isla del Phishing",
    tag: "El anzuelo",
    desc: "Los atacantes te lanzan un mensaje falso para robarte tus datos. Aquí aprenderás a reconocer las señales antes de hacer clic.",
    pos: { top: "24%", left: "22%" },
  },
  {
    key: "malware",
    name: "Isla del Malware",
    tag: "El enjambre",
    desc: "Un programa dañino se cuela en tu equipo y hace de las suyas. Aquí verás cómo se propaga y cómo detenerlo.",
    pos: { top: "16%", left: "68%" },
  },
  {
    key: "contrasenas",
    name: "Isla de las Contraseñas Expuestas",
    tag: "La bóveda",
    desc: "Una contraseña filtrada abre puertas que creías cerradas. Aquí aprenderás a crear y proteger tus claves de acceso.",
    pos: { top: "56%", left: "15%" },
  },
  {
    key: "dispositivos",
    name: "Isla de los Dispositivos Comprometidos",
    tag: "El enchufe",
    desc: "Un USB o un dispositivo desconocido puede llevar tu información lejos. Aquí aprenderás a reconocer lo que no es tuyo.",
    pos: { top: "60%", left: "48%" },
  },
  {
    key: "acceso",
    name: "Isla del Acceso No Autorizado",
    tag: "El muro",
    desc: "Hay partes de internet que no son para ti. Aquí aprenderás a distinguir una página legítima de una que no lo es.",
    pos: { top: "54%", left: "83%" },
  },
];

export const islandByKey = (key: IslandKey | null) =>
  ISLANDS.find((i) => i.key === key) ?? null;

export function shuffle<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const WORDS = [
  { word: "Sol", emoji: "☀️" },
  { word: "Luna", emoji: "🌙" },
  { word: "Casa", emoji: "🏠" },
  { word: "Perro", emoji: "🐶" },
  { word: "Gato", emoji: "🐱" },
  { word: "Flor", emoji: "🌸" },
  { word: "Árbol", emoji: "🌳" },
  { word: "Pelota", emoji: "⚽" },
  { word: "Pez", emoji: "🐟" },
  { word: "Estrella", emoji: "⭐" },
];

export const WEATHERS = [
  { key: "sol", label: "Hoy hace sol ☀️", need: ["gorra", "camiseta", "short"] },
  { key: "lluvia", label: "Hoy está lloviendo 🌧️", need: ["impermeable", "botas", "paraguas"] },
  { key: "frio", label: "Hoy hace mucho frío ❄️", need: ["abrigo", "bufanda", "gorro"] },
];

export const CLOTHES: Record<string, string> = {
  gorra: "🧢",
  camiseta: "👕",
  short: "🩳",
  impermeable: "🧥",
  botas: "👢",
  paraguas: "☂️",
  abrigo: "🧥",
  bufanda: "🧣",
  gorro: "🎩",
  sandalias: "👡",
  guantes: "🧤",
  chaleco: "🦺",
};

export const CLOTH_DISTRACTORS = ["sandalias", "guantes", "chaleco"];

export const CATEGORIES = [
  { key: "animales", label: "Animales 🐾", items: ["🐶", "🐱", "🐘", "🐦"] },
  { key: "frutas", label: "Frutas 🍎", items: ["🍌", "🍇", "🍊", "🍓"] },
  { key: "vehiculos", label: "Vehículos 🚗", items: ["🚗", "🚌", "✈️", "🚲"] },
];

export const SYMBOLS = [
  "🐶",
  "🐱",
  "🐰",
  "🦊",
  "🐼",
  "🐸",
  "🐵",
  "🦁",
  "🐷",
  "🐔",
  "🐧",
  "🦋",
  "🐝",
  "🐢",
  "🐳",
  "🍎",
];

export const MEMORY_LEVELS = [4, 6, 8];

export const RECIPES = [
  { name: "Sándwich", steps: ["🍞", "🥬", "🍅", "🧀", "🍞"] },
  { name: "Hamburguesa", steps: ["🍞", "🥩", "🧀", "🥬", "🍞"] },
  { name: "Taco", steps: ["🫓", "🥩", "🧅", "🧀", "🍅"] },
  { name: "Pizza", steps: ["🫓", "🍅", "🧀", "🍄"] },
  { name: "Perro caliente", steps: ["🌭", "🧅", "🍅", "🧀"] },
];

export const FOOD_DISTRACTORS = ["🥕", "🍇", "🍪", "🥨", "🍩", "🥦"];
