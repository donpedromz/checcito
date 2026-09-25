"use client";

import { useEffect, useState } from "react";
import { Brief, Dots, ReportCard, Socratic } from "./LabChrome";
import { freshMetrics, grade, socratic, type Metrics } from "@/lib/tutor";
import { useFx } from "../Fx";
import type { GameProps } from "./types";

const SOCRATIC_BANK = {
  steal: {
    ask: "Entraste al clon y escribiste tus credenciales. ¿En qué letra te traicionó el dominio? ¿Qué haces AHORA con esa clave?",
    hint: "banc0 con cero. Y esa clave ya está comprometida: según NIST se cambia SOLO cuando hay compromiso… y este lo es (Isla 3).",
  },
  plugin: {
    ask: "Instalaste un .exe disfrazado de «plugin para ver». ¿Qué te pidió la página que ningún sitio legítimo pide?",
    hint: "Un reproductor web no necesita un ejecutable. Plugin + prisa = malware.",
  },
};

const URL_SIGNALS = [
  "Typo en el dominio (banc0 con cero)",
  "Pide instalar un .exe como plugin",
  "Redirección a un dominio distinto",
  "Urgencia para que no verifiques",
  "Falta https / certificado raro",
  "La página se ve moderna",
];

type Phase = "brief" | "bank" | "stream" | "caught" | "retry" | "signals" | "dns" | "done";

export default function SiteLab({ onFinish, onStatus }: GameProps) {
  const { celebrate, toast } = useFx();
  const [phase, setPhase] = useState<Phase>("brief");
  const [m, setM] = useState<Metrics>(freshMetrics);
  const [bankDomain, setBankDomain] = useState<string | null>(null);
  const [caught, setCaught] = useState<"steal" | "plugin" | null>(null);
  const [signals, setSignals] = useState<string[]>([]);
  const [dns, setDns] = useState<string | null>(null);

  useEffect(() => {
    onStatus(phase === "done" || phase === "brief" ? "" : "Navegador");
  }, [phase, onStatus]);

  const bump = (k: keyof Metrics, n = 1) => setM((p) => ({ ...p, [k]: p[k] + n }));

  if (phase === "brief") {
    return (
      <Brief
        title="Teclea tú. Verifica. Ante warning: atrás."
        time="5 min"
        points={[
          "No sigas links: teclea tú el dominio en la barra.",
          "Revisa https + dominio exacto letra por letra + certificado.",
          "Ante un aviso del navegador: atrás + reporta. Nunca «continuar de todos modos».",
        ]}
        startLabel="Abrir el navegador simulado"
        onStart={() => setPhase("bank")}
      />
    );
  }

  if (phase === "bank") {
    return (
      <>
        <Dots total={5} current={1} />
        <div className="browser">
          <p className="browser-bar">https://banc0-seguro.com/login</p>
          <div className="lab-card">
            <p className="lab-kicker">Link 1/2 · «Banco: accede a tu cuenta»</p>
            <h3>Predice: ¿cuál es el dominio real de ese link?</h3>
            <div className="pick-grid">
              {["banc0-seguro.com", "banco-seguro.com", "seguro.com"].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`tile${bankDomain === d ? " selected" : ""}`}
                  onClick={() => setBankDomain(d)}
                >
                  <code>{d}</code>
                </button>
              ))}
            </div>
            {bankDomain && bankDomain !== "banc0-seguro.com" && (
              <p className="blocklist-fail">Ese es el que QUERRÍAS que fuera. Lee la barra letra por letra.</p>
            )}
            {bankDomain === "banc0-seguro.com" && (
              <>
                <p className="mail-state">✓ banc0 con cero. Es un clon. Ahora decide:</p>
                <div className="btn-row">
                  <button type="button" className="btn btn-ghost" onClick={() => { bump("attempts"); bump("errors"); setCaught("steal"); setPhase("caught"); }}>
                    Entrar igual
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => { bump("attempts"); bump("reports"); celebrate(false); setPhase("stream"); }}>
                    Atrás y reportar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  if (phase === "stream") {
    return (
      <>
        <Dots total={5} current={2} />
        <div className="browser">
          <p className="browser-bar">https://partidos-gratis-tv.com/ver</p>
          <div className="lab-card">
            <p className="lab-kicker">Link 2/2 · streaming + plugin</p>
            <h3>«Para ver, instala nuestro reproductor» (reproductor.exe)</h3>
            <div className="btn-row">
              <button type="button" className="btn btn-ghost" onClick={() => { bump("attempts"); bump("errors"); setCaught("plugin"); setPhase("caught"); }}>
                Instalar plugin
              </button>
              <button type="button" className="btn btn-primary" onClick={() => { bump("attempts"); bump("reports"); celebrate(false); setPhase(m.errors === 0 ? "signals" : "retry"); }}>
                Salir y reportar
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (phase === "caught" && caught) {
    const turn = socratic(caught, SOCRATIC_BANK);
    return (
      <>
        <div className="lab-card frozen">
          <p className="lab-kicker">
            {caught === "steal" ? "Clon bancario · robo simulado" : "Plugin falso · .exe disfrazado"}
          </p>
          <p>
            {caught === "steal"
              ? "Escribiste usuario y clave en el clon + se descargó «actualizacion.exe». Protocolo: cerrar, limpiar, verificar por DNS seguro, usar solo sitios aprobados. Y esa clave se rota AHORA (compromiso = cambio obligatorio, Isla 3)."
              : "El «reproductor» era malware empaquetado. Protocolo: no ejecutar, cerrar, limpiar, DNS seguro, solo app store y sitios aprobados."}
          </p>
        </div>
        <Socratic
          ask={turn.ask}
          hint={turn.hint}
          actionLabel="Cierro, limpio y no entro"
          onNext={() => {
            setCaught(null);
            bump("reports");
            setPhase("retry");
          }}
        />
      </>
    );
  }

  if (phase === "retry") {
    return (
      <>
        <Dots total={5} current={3} />
        <div className="browser">
          <p className="browser-bar">https://recetas-gratis-premium.com ⚠ redirigido</p>
          <div className="lab-card">
            <p className="lab-kicker">Reintento · watering-hole</p>
            <h3>Tu web de recetas de todos los días hoy redirige aquí y pide un plugin. ¿Qué haces?</h3>
            <div className="btn-row">
              <button type="button" className="btn btn-ghost" onClick={() => { bump("errors"); bump("attempts"); toast("Caíste en el watering-hole. Bloquea y reporta."); }}>
                Seguir y poner el plugin
              </button>
              <button type="button" className="btn btn-primary" onClick={() => { bump("attempts"); bump("reports"); bump("retries"); celebrate(false); setPhase("signals"); }}>
                Bloquear redirección y reportar
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (phase === "signals") {
    const correct = signals.filter((s) =>
      ["Typo en el dominio (banc0 con cero)", "Pide instalar un .exe como plugin", "Redirección a un dominio distinto", "Urgencia para que no verifiques", "Falta https / certificado raro"].includes(s),
    ).length;
    return (
      <>
        <Dots total={5} current={4} />
        <div className="lab-card">
          <p className="lab-kicker">Debrief · 3 señales de URL maligna</p>
          <h3>Marca 3 (hay 5 correctas y 1 trampa)</h3>
          <div className="pick-grid">
            {URL_SIGNALS.map((s) => (
              <button
                key={s}
                type="button"
                className={`tile${signals.includes(s) ? " selected" : ""}`}
                onClick={() =>
                  setSignals((p) => (p.includes(s) ? p.filter((x) => x !== s) : p.length < 3 ? [...p, s] : p))
                }
              >
                {s}
              </button>
            ))}
          </div>
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={signals.length !== 3}
              onClick={() => {
                if (correct === 3) {
                  celebrate(false);
                  setPhase("dns");
                } else {
                  toast(`Llevas ${correct}/3. «Se ve moderna» no es una señal.`);
                  setSignals([]);
                }
              }}
            >
              Defiendo mi navegación ({signals.length}/3)
            </button>
          </div>
        </div>
      </>
    );
  }

  if (phase === "dns") {
    return (
      <>
        <Dots total={5} current={5} />
        <div className="lab-card">
          <p className="lab-kicker">Última pregunta</p>
          <h3>¿Qué es el DNS protectivo?</h3>
          <div className="pick-grid">
            {[
              "Un filtro que bloquea dominios malignos antes de entrar (Quad9 / Cloudflare)",
              "Un antivirus para el navegador",
              "Una VPN gratis para ver streaming",
            ].map((o) => (
              <button
                key={o}
                type="button"
                className={`tile${dns === o ? " selected" : ""}`}
                onClick={() => setDns(o)}
              >
                {o}
              </button>
            ))}
          </div>
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!dns}
              onClick={() => {
                if (dns !== "Un filtro que bloquea dominios malignos antes de entrar (Quad9 / Cloudflare)") {
                  toast("Eso no filtra nada. Piensa en quién resuelve el dominio…");
                  bump("errors");
                  setDns(null);
                  return;
                }
                celebrate(true);
                setPhase("done");
              }}
            >
              Cierro el navegador
            </button>
          </div>
        </div>
      </>
    );
  }

  const stars = grade(m.errors, m.retries);
  return (
    <ReportCard
      title="Isla del Acceso · métricas NIST"
      rows={[
        { label: "Accesos no autorizados", value: String(m.errors) },
        { label: "Bloqueos + reportes", value: String(m.reports) },
        { label: "Reintentos", value: String(m.retries) },
      ]}
      stars={stars}
      verdict={
        stars === 3
          ? "0 accesos + 3 señales + DNS protectivo. Navegación corregida."
          : "Cerrado en variante watering-hole. Teclea tú, verifica, atrás ante warnings."
      }
      onDone={() => onFinish(stars)}
    />
  );
}
