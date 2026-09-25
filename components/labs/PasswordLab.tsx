"use client";

import { useEffect, useState } from "react";
import { Brief, Dots, ReportCard, Socratic } from "./LabChrome";
import { freshMetrics, grade, socratic, type Metrics } from "@/lib/tutor";
import { useFx } from "../Fx";
import type { GameProps } from "./types";

const WORDS = [
  "gato", "luna", "puente", "tigre", "nube", "cafe", "rio", "bosque",
  "trueno", "vela", "mapa", "faro", "tambor", "nieve", "costa", "robot",
  "jirafa", "torta", "viento", "piano", "selva", "tren", "lago", "cuerda",
];

const BLOCKLIST = ["password1!", "password1", "123456", "qwerty", "invierno2025", "admin123"];

const CLASSIFY = [
  { pw: "Password1!", ok: false, why: "Está en todas las filtraciones aunque «cumpla reglas»." },
  { pw: "gato-luna-puente-tigre-9", ok: true, why: "Larga, única y no predecible." },
  { pw: "Invierno2025", ok: false, why: "Patrón de temporada + año: el ataque híbrido lo prueba primero." },
  { pw: "8&kZ!q2$mVpLx#9", ok: true, why: "Aleatoria y larga: solo viable con gestor." },
  { pw: "Empresa2026!", ok: false, why: "Palabra de contexto + año: predecible y reutilizada." },
];

function mutate(style: string): string[] {
  const s = style.trim() || "Invierno2025";
  const year = s.match(/(19|20)\d{2}/);
  const bumped = year ? s.replace(year[0], String(Number(year[0]) + 1)) : `${s}2026`;
  return [bumped, `${s}!`, s.replace(/a/gi, "@").replace(/o/gi, "0"), `${s}$`];
}

const SOCRATIC_BANK = {
  style: {
    ask: "Mira esas 4 variantes: ¿cuánto tardaría un atacante en probarlas? ¿Qué tienen en común todas tus claves?",
    hint: "El ataque híbrido prueba tu base + año+1, +!, leet y sufijos. Si tu «nueva» clave es una variante, ya está rota.",
  },
  block: {
    ask: "Password1! tiene mayúscula, número y símbolo… y aun así falla. ¿Qué le falta que ninguna regla de composición le puede dar?",
    hint: "Las reglas miran la forma. La blocklist mira la historia: si millones ya la usaron y se filtró, está muerta.",
  },
};

type Phase = "brief" | "attack" | "block" | "coach" | "retry" | "quiz" | "done";

export default function PasswordLab({ onFinish, onStatus }: GameProps) {
  const { celebrate, toast } = useFx();
  const [phase, setPhase] = useState<Phase>("brief");
  const [m, setM] = useState<Metrics>(freshMetrics);
  const [style, setStyle] = useState("");
  const [shown, setShown] = useState(false);
  const [passphrases, setPassphrases] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [mfa, setMfa] = useState(false);
  const [classified, setClassified] = useState<Record<string, boolean>>({});
  const [mine, setMine] = useState("");
  const [rotation, setRotation] = useState<string | null>(null);

  useEffect(() => {
    onStatus(phase === "done" ? "" : "Bóveda");
  }, [phase, onStatus]);

  const bump = (k: keyof Metrics, n = 1) => setM((p) => ({ ...p, [k]: p[k] + n }));
  const variants = mutate(style);

  const genPassphrases = () => {
    const pick = () => WORDS[Math.floor(Math.random() * WORDS.length)];
    setPassphrases(
      Array.from({ length: 3 }, () => `${pick()}-${pick()}-${pick()}-${pick()}-${Math.floor(Math.random() * 90 + 10)}`),
    );
  };

  const mineOk = mine.trim().length >= 15 && !BLOCKLIST.includes(mine.trim().toLowerCase());
  const retryDone =
    Object.keys(classified).length === CLASSIFY.length &&
    Object.entries(classified).every(([pw, v]) => v === CLASSIFY.find((c) => c.pw === pw)?.ok);

  if (phase === "brief") {
    return (
      <Brief
        title="Larga > compleja · Única · Con MFA"
        time="5 min"
        points={[
          "4 palabras > 1 palabra rara: la longitud manda (NIST: 15+).",
          "Única por sitio + gestor. Nada se guarda aquí: todo es local.",
          "MFA siempre. Y solo se cambia si hay compromiso, no por calendario.",
        ]}
        startLabel="Romper mi estilo de clave"
        onStart={() => setPhase("attack")}
      />
    );
  }

  if (phase === "attack") {
    const turn = socratic("style", SOCRATIC_BANK);
    return (
      <>
        <Dots total={4} current={1} />
        <div className="lab-card">
          <p className="lab-kicker">Ataque híbrido simulado · nada se guarda</p>
          <h3>Escribe el ESTILO que sueles usar (no tu clave real)</h3>
          <input
            className="lab-input"
            value={style}
            onChange={(e) => {
              setStyle(e.target.value);
              setShown(false);
            }}
            placeholder="Ej: Invierno2025"
            autoComplete="off"
          />
          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={() => { setShown(true); bump("attempts"); }}>
              Atácame
            </button>
          </div>
          {shown && (
            <div className="crack-box">
              <p>El atacante probaría, en segundos:</p>
              <ul>
                {variants.map((v) => (
                  <li key={v}>
                    <code>{v}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {shown && (
          <Socratic
            ask={turn.ask}
            hint={turn.hint}
            actionLabel="Lo veo: mis variantes están muertas"
            onNext={() => setPhase("block")}
          />
        )}
      </>
    );
  }

  if (phase === "block") {
    const turn = socratic("block", SOCRATIC_BANK);
    return (
      <>
        <Dots total={4} current={2} />
        <div className="lab-card">
          <p className="lab-kicker">Blocklist NIST · haveibeenpwned</p>
          <h3>
            Candidata: <code>Password1!</code>
          </h3>
          <p className="blocklist-fail">✗ FILTRADA — aparece en millones de brechas</p>
          <p>Tiene mayúscula, número y símbolo. Y da igual: cumplir reglas no es estar a salvo.</p>
        </div>
        <Socratic
          ask={turn.ask}
          hint={turn.hint}
          actionLabel="Voy a por una passphrase de verdad"
          onNext={() => setPhase("coach")}
        />
      </>
    );
  }

  if (phase === "coach") {
    return (
      <>
        <Dots total={4} current={3} />
        <div className="lab-card">
          <p className="lab-kicker">Coach de reparación · gestor + MFA</p>
          <h3>Elige tu passphrase (15+ caracteres)</h3>
          <div className="btn-row">
            <button type="button" className="btn btn-ghost" onClick={genPassphrases}>
              Generar 3
            </button>
          </div>
          <div className="pick-grid">
            {passphrases.map((p) => (
              <button
                key={p}
                type="button"
                className={`tile${chosen === p ? " selected" : ""}`}
                onClick={() => setChosen(p)}
              >
                <code>{p}</code>
              </button>
            ))}
          </div>
          {chosen && (
            <>
              <p className="mail-state">Guardada en el gestor ✓ (simulado)</p>
              <button
                type="button"
                className={`btn ${mfa ? "btn-primary" : "btn-listen"}`}
                onClick={() => setMfa(true)}
              >
                {mfa ? "MFA activado ✓" : "Activar MFA"}
              </button>
            </>
          )}
          {chosen && mfa && (
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  celebrate(true);
                  bump("reports");
                  bump("retries");
                  setPhase("retry");
                }}
              >
                Cerrar la bóveda
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  if (phase === "retry") {
    return (
      <>
        <Dots total={4} current={4} />
        <div className="lab-card">
          <p className="lab-kicker">Reintento · clasifica 5 + crea 1</p>
          <h3>¿Pasa la blocklist?</h3>
          {CLASSIFY.map((c) => (
            <div key={c.pw} className="classify-row">
              <code>{c.pw}</code>
              <div>
                <button
                  type="button"
                  className={`btn btn-ghost${classified[c.pw] === true ? " picked" : ""}`}
                  onClick={() => {
                    if (!c.ok) bump("errors");
                    setClassified((p) => ({ ...p, [c.pw]: true }));
                  }}
                >
                  Pasa
                </button>
                <button
                  type="button"
                  className={`btn btn-ghost${classified[c.pw] === false ? " picked" : ""}`}
                  onClick={() => {
                    if (c.ok) bump("errors");
                    setClassified((p) => ({ ...p, [c.pw]: false }));
                  }}
                >
                  Falla
                </button>
              </div>
              {classified[c.pw] !== undefined && (
                <p className={classified[c.pw] === c.ok ? "mail-state" : "blocklist-fail"}>
                  {classified[c.pw] === c.ok ? "✓" : "✗"} {c.why}
                </p>
              )}
            </div>
          ))}
          <h3>Crea tu passphrase válida (15+)</h3>
          <input
            className="lab-input"
            value={mine}
            onChange={(e) => setMine(e.target.value)}
            placeholder="mínimo 15 caracteres"
            autoComplete="off"
          />
          <p className="mail-state">
            {mine.trim().length}/15 {mineOk ? "✓ válida" : ""}
          </p>
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!retryDone || !mineOk}
              onClick={() => setPhase("quiz")}
            >
              Lo tengo
            </button>
          </div>
        </div>
      </>
    );
  }

  if (phase === "quiz") {
    return (
      <div className="lab-card">
        <p className="lab-kicker">Última pregunta</p>
        <h3>¿Por qué NO rotar la clave por calendario?</h3>
        <div className="pick-grid">
          {[
            "Porque genera variaciones predecibles y débiles",
            "Porque a los atacantes les da igual",
            "Porque el gestor lo hace solo",
          ].map((o) => (
            <button
              key={o}
              type="button"
              className={`tile${rotation === o ? " selected" : ""}`}
              onClick={() => setRotation(o)}
            >
              {o}
            </button>
          ))}
        </div>
        <div className="btn-row">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!rotation}
            onClick={() => {
              if (rotation !== "Porque genera variaciones predecibles y débiles") {
                toast("Casi. Piensa en Invierno2025 → Invierno2026…");
                bump("errors");
                setRotation(null);
                return;
              }
              setPhase("done");
            }}
          >
            Cierro la bóveda
          </button>
        </div>
      </div>
    );
  }

  const stars = grade(m.errors, m.retries);
  return (
    <ReportCard
      title="Isla de las Contraseñas · métricas NIST"
      rows={[
        { label: "Estilos rotos", value: String(m.errors) },
        { label: "Passphrase + MFA", value: mfa ? "Sí" : "No" },
        { label: "Reintentos", value: String(m.retries) },
      ]}
      stars={stars}
      verdict={
        stars === 3
          ? "Passphrase 15+ única + MFA + sin rotación por calendario."
          : "Bóveda cerrada en reintento. Recuerda: larga, única, con gestor y MFA."
      }
      onDone={() => onFinish(stars)}
    />
  );
}
