/**
 * Identidad CHEC — ingeniería inversa de chec.com.co al 2026-09-25.
 * NO es manual oficial. Verificar contra documento interno EPM antes de uso contractual.
 */
export const CHEC = {
  brand: {
    lockup: "CHEC Grupo EPM",
    claim: "la vida nos mueve",
    purpose: "Contribuimos a la armonía de la vida para un mundo mejor",
    logo: "/brand/Chec.svg",
    logoSize: { width: 218, height: 45 },
  },
  ui: {
    primary: "#80A022",
    primaryDark: "#007934",
    primaryDeep: "#005121",
    greenMid: "#229325",
    greenAlt: "#36A21D",
    greenSoft: "#5EA943",
    lime: "#7AD400",
    accentOrange: "#FF7900",
    accentOrangeSoft: "#E9872F",
    accentBrown: "#BC5900",
    infoBlue: "#0579BA",
    gold: "#D6AA00",
    text: "#202020",
    textSecondary: "#545454",
    textMuted: "#707070",
    textFaint: "#8B8D8E",
    line: "#E8E8E8",
    bgSoft: "#F6F6F6",
    white: "#FFFFFF",
    black: "#000000",
  },
  radius: {
    card: "25px",
    pill: "50px",
    pillXl: "75px",
    input: "1rem",
  },
  // EPM-Rounded/Sans son propietarias (requieren licencia). Fallback web:
  fontStack: "system-ui, -apple-system, 'Segoe UI', sans-serif",
} as const;

export type ChecTokens = typeof CHEC;
