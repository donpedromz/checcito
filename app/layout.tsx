import type { Metadata, Viewport } from "next";
import { Press_Start_2P, Silkscreen } from "next/font/google";
import "./globals.css";

const silkscreen = Silkscreen({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const pressStart = Press_Start_2P({
  variable: "--font-title",
  subsets: ["latin"],
  weight: "400", // no es variable font: solo existe 400
  display: "swap",
});

export const metadata: Metadata = {
  title: "Checcito · CHEC Grupo EPM",
  description:
    "Checcito — La Isla de Aprender. Cinco islas de entrenamiento en ciberseguridad: phishing, malware, contraseñas expuestas, dispositivos comprometidos y acceso no autorizado.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#80A022",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${silkscreen.variable} ${pressStart.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
