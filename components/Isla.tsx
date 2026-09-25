"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FxProvider, useFx } from "./Fx";
import Sea from "./Sea";
import Boot from "./Boot";
import Map from "./Map";
import Intro from "./Intro";
import GameHost from "./GameHost";
import { islandByKey, type IslandKey } from "@/lib/data";
import { getServerStars, getStars, saveStars, subscribeStars, type Stars } from "@/lib/progress";
import { stopSpeaking } from "@/lib/fx";

type Screen = "map" | "intro" | "game";

function Isla() {
  const [booted, setBooted] = useState(false);
  const [screen, setScreen] = useState<Screen>("map");
  const [current, setCurrent] = useState<IslandKey | null>(null);
  const stars = useSyncExternalStore<Stars>(subscribeStars, getStars, getServerStars);
  const { celebrate } = useFx();

  const goMap = () => {
    stopSpeaking();
    setScreen("map");
    setCurrent(null);
  };

  const finish = (earned: number) => {
    if (!current) return;
    const prev = getStars();
    saveStars({ ...prev, [current]: Math.max(prev[current] ?? 0, earned) });
    celebrate(true);
    setTimeout(goMap, 1800);
  };

  const island = islandByKey(current);

  return (
    <div className="app-shell">
      <Sea />
      <AnimatePresence>{!booted && <Boot key="boot" onDone={() => setBooted(true)} />}</AnimatePresence>
      {booted && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${screen}-${current ?? "none"}`}
            className="screen"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {screen === "map" && (
              <Map
                stars={stars}
                onPick={(key) => {
                  setCurrent(key);
                  setScreen("intro");
                }}
              />
            )}
            {screen === "intro" && island && (
              <div className="scrim">
                <Intro island={island} onBack={goMap} onPlay={() => setScreen("game")} />
              </div>
            )}
            {screen === "game" && current && (
              <div className="scrim">
                <GameHost islandKey={current} onBack={goMap} onFinish={finish} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default function IslaRoot() {
  return (
    <FxProvider>
      <Isla />
    </FxProvider>
  );
}
