"use client";

import { useEffect, useState } from "react";
import { Brief, Dots, ReportCard, Socratic } from "./LabChrome";
import { freshMetrics, grade, socratic, type Metrics } from "@/lib/tutor";
import { useFx } from "../Fx";
import type { GameProps } from "./types";

const FLOW = [
  "Registrar el ID del dispositivo en inventario",
  "Verificar que es USB corp + cifrado",
  "Revisar permisos: lectura/escritura según política",
  "Reportar el hallazgo/pérdida a IT",
];

const MEASURES = ["Autorun OFF", "Bloqueo de puertos USB", "Abrirlo para ver de quién es", "Usarlo si el antivirus no dice nada"];

const RETRY_CASES = [
  { id: "mate", title: "USB «de un compañero»", detail: "Te lo deja en la mesa: «te paso los archivos por aquí, es más rápido»." },
  { id: "promo", title: "USB promocional de un evento", detail: "Regalo del stand con el catálogo dentro. Sin cifrar, sin inventario." },
];

const SOCRATIC_BANK = {
  plug: {
    ask: "Auto-ejecución completada: era un BadUSB y ya se propaga a la red. En la sim es reversible; en tu equipo no. ¿Qué política acabas de violar?",
    hint: "Desconocido = no se conecta. Ni «para ver de quién es». Se custodia y se entrega.",
  },
  sensitive: {
    ask: "El USB trae información sensible sin cifrar. ¿La copias para devolverla, lo formateas, o qué haces exactamente?",
    hint: "Copiarla la expone más. Formatearlo destruye evidencia. Hay un tercer camino.",
  },
};

type Phase = "brief" | "choice" | "badusb" | "flow" | "quiz" | "retry" | "done";

export default function UsbLab({ onFinish, onStatus }: GameProps) {
  const { celebrate, toast } = useFx();
  const [phase, setPhase] = useState<Phase>("brief");
  const [m, setM] = useState<Metrics>(freshMetrics);
  const [flow, setFlow] = useState<string[]>([]);
  const [measures, setMeasures] = useState<string[]>([]);
  const [sensitive, setSensitive] = useState<string | null>(null);
  const [retryDone, setRetryDone] = useState<Record<string, string>>({});

  useEffect(() => {
    onStatus(phase === "done" ? "" : "USB");
  }, [phase, onStatus]);

  const bump = (k: keyof Metrics, n = 1) => setM((p) => ({ ...p, [k]: p[k] + n }));
  const flowOk = FLOW.every((f) => flow.includes(f));
  const measuresOk =
    measures.includes("Autorun OFF") && measures.includes("Bloqueo de puertos USB") && measures.length === 2;

  if (phase === "brief") {
    return (
      <Brief
        title="Desconocido = no se conecta"
        time="5 min"
        points={[
          "USB desconocido: se custodia y se entrega a IT. Nunca se conecta.",
          "Solo USB corp registrado + cifrado en equipo corp.",
          "Autorun OFF + antivirus antes de abrir nada.",
        ]}
        startLabel="Salir al parking"
        onStart={() => setPhase("choice")}
      />
    );
  }

  if (phase === "choice") {
    return (
      <>
        <Dots total={4} current={1} />
        <div className="lab-card">
          <p className="lab-kicker">Escenario · parking, 08:40</p>
          <h3>USB en el suelo, etiqueta: «Nóminas 2026»</h3>
          <p>Brilla. Tienta. Elige tu camino:</p>
          <div className="pick-grid">
            <button type="button" className="tile" onClick={() => { bump("attempts"); bump("errors"); setPhase("badusb"); }}>
              Conectar al equipo para ver de quién es
            </button>
            <button type="button" className="tile" onClick={() => { bump("attempts"); bump("reports"); setPhase("flow"); }}>
              Llevar a IT sin conectarlo
            </button>
            <button type="button" className="tile" onClick={() => { bump("attempts"); bump("reports"); setPhase("flow"); }}>
              Kiosco de escaneo + inventario
            </button>
          </div>
        </div>
      </>
    );
  }

  if (phase === "badusb") {
    const turn = socratic("plug", SOCRATIC_BANK);
    return (
      <>
        <div className="lab-card frozen">
          <p className="lab-kicker">Simulación BadUSB · reversible aquí, fatal fuera</p>
          <p className="blocklist-fail">Auto-ejecución → finge ser teclado → roba credenciales → se propaga a red</p>
          <p>Eso acaba de pasar en la sim. En tu equipo real no habría botón de deshacer.</p>
        </div>
        <Socratic
          ask={turn.ask}
          hint={turn.hint}
          actionLabel="Practico el flujo correcto"
          onNext={() => setPhase("flow")}
        />
      </>
    );
  }

  if (phase === "flow") {
    return (
      <>
        <Dots total={4} current={2} />
        <div className="lab-card">
          <p className="lab-kicker">Flujo IT · marca los 4 pasos</p>
          <div className="pick-grid">
            {FLOW.map((f) => (
              <button
                key={f}
                type="button"
                className={`tile${flow.includes(f) ? " selected" : ""}`}
                onClick={() => setFlow((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]))}
              >
                {f}
              </button>
            ))}
          </div>
          <h3>2 medidas técnicas (marca 2)</h3>
          <div className="pick-grid">
            {MEASURES.map((t) => (
              <button
                key={t}
                type="button"
                className={`tile${measures.includes(t) ? " selected" : ""}`}
                onClick={() =>
                  setMeasures((p) => (p.includes(t) ? p.filter((x) => x !== t) : p.length < 2 ? [...p, t] : p))
                }
              >
                {t}
              </button>
            ))}
          </div>
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!flowOk || !measuresOk}
              onClick={() => {
                if (!measuresOk) {
                  toast("Revisa: abrirlo «para ver» y fiarte del antivirus no son medidas.");
                  return;
                }
                celebrate(false);
                setPhase("quiz");
              }}
            >
              Flujo completado
            </button>
          </div>
        </div>
      </>
    );
  }

  if (phase === "quiz") {
    const turn = socratic("sensitive", SOCRATIC_BANK);
    return (
      <>
        <Dots total={4} current={3} />
        <div className="lab-card">
          <p className="lab-kicker">Caso sensible</p>
          <h3>El USB trae información sensible sin cifrar. ¿Qué haces?</h3>
          <div className="pick-grid">
            {["Avisar a IT sin copiar nada", "Copiarla para devolverla a su dueño", "Formatearlo y quedártelo"].map((o) => (
              <button
                key={o}
                type="button"
                className={`tile${sensitive === o ? " selected" : ""}`}
                onClick={() => setSensitive(o)}
              >
                {o}
              </button>
            ))}
          </div>
          {sensitive && sensitive !== "Avisar a IT sin copiar nada" && (
            <Socratic
              ask={turn.ask}
              hint={turn.hint}
              actionLabel="Entendido: aviso sin tocar"
              onNext={() => {
                bump("errors");
                setSensitive("Avisar a IT sin copiar nada");
              }}
            />
          )}
          {sensitive === "Avisar a IT sin copiar nada" && (
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  celebrate(true);
                  if (m.errors > 0) {
                    bump("retries");
                    setPhase("retry");
                  } else {
                    setPhase("done");
                  }
                }}
              >
                Cierro el caso
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  if (phase === "retry") {
    const both = RETRY_CASES.every((c) => retryDone[c.id] === "it");
    return (
      <>
        <Dots total={4} current={4} />
        <div className="lab-card">
          <p className="lab-kicker">Reintento · 2 USB cotidianos</p>
          <h3>En equipo corp: ¿conectar o rechazar + IT?</h3>
          {RETRY_CASES.map((c) => (
            <div key={c.id} className="classify-row">
              <p className="mail-subject">{c.title}</p>
              <p className="mail-body">{c.detail}</p>
              {retryDone[c.id] !== "it" ? (
                <div>
                  <button type="button" className="btn btn-ghost" onClick={() => { bump("errors"); bump("attempts"); toast("BadUSB otra vez. Ese también era trampa: rechaza + IT."); }}>
                    Conectar
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => { bump("attempts"); bump("reports"); setRetryDone((p) => ({ ...p, [c.id]: "it" })); }}>
                    Rechazar + IT
                  </button>
                </div>
              ) : (
                <p className={retryDone[c.id] === "it" ? "mail-state" : "blocklist-fail"}>
                  {retryDone[c.id] === "it" ? "✓ Flujo IT aplicado" : "✗ Lo conectaste: BadUSB otra vez"}
                </p>
              )}
            </div>
          ))}
          {both && (
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  bump("retries");
                  setPhase("done");
                }}
              >
                Termino el reintento
              </button>
            </div>
          )}

        </div>
      </>
    );
  }

  const stars = grade(m.errors, m.retries);
  return (
    <ReportCard
      title="Isla de Dispositivos · métricas NIST"
      rows={[
        { label: "Conexiones directas", value: String(m.errors) },
        { label: "Flujos IT correctos", value: String(m.reports) },
        { label: "Reintentos", value: String(m.retries) },
      ]}
      stars={stars}
      verdict={
        stars === 3
          ? "0 conexiones + flujo completo + Autorun OFF y puertos bloqueados."
          : "Caso cerrado en reintento. Desconocido = custodiar + IT, siempre."
      }
      onDone={() => onFinish(stars)}
    />
  );
}
