"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import { islandByKey, type IslandKey } from "@/lib/data";
import PhishingLab from "./labs/PhishingLab";
import MalwareLab from "./labs/MalwareLab";
import PasswordLab from "./labs/PasswordLab";
import UsbLab from "./labs/UsbLab";
import SiteLab from "./labs/SiteLab";
import type { GameProps } from "./labs/types";

const LABS: Record<IslandKey, ComponentType<GameProps>> = {
  phishing: PhishingLab,
  malware: MalwareLab,
  contrasenas: PasswordLab,
  dispositivos: UsbLab,
  acceso: SiteLab,
};

export default function GameHost({
  islandKey,
  onBack,
  onFinish,
}: {
  islandKey: IslandKey;
  onBack: () => void;
  onFinish: (stars: number) => void;
}) {
  const [status, setStatus] = useState<ReactNode>(null);
  const island = islandByKey(islandKey)!;
  const Lab = LABS[islandKey];

  return (
    <>
      <div className="topbar">
        <button type="button" className="back-btn" onClick={onBack}>
          ← Mapa
        </button>
        <span>{status}</span>
      </div>
      <h2 className="stage-title">
        {island.tag} · {island.name}
      </h2>
      <div className="game-wrap">
        <Lab key={islandKey} onFinish={onFinish} onStatus={setStatus} />
      </div>
    </>
  );
}
