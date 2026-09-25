"use client";

import { useEffect, useState } from "react";
import { Brief, Dots, ReportCard, Socratic } from "./LabChrome";
import { freshMetrics, grade, socratic, type Metrics } from "@/lib/tutor";
import { useFx } from "../Fx";
import type { GameProps } from "./types";

type Mail = {
  id: string;
  from: string;
  realFrom: string;
  subject: string;
  body: string;
  link?: string;
  realUrl?: string;
  evil: boolean;
  signals: string[];
};

const INBOX: Mail[] = [
  {
    id: "factura",
    from: "Facturación Amazon",
    realFrom: "facturas@amaz0n-pagos.com",
    subject: "Tu factura vence HOY: paga ahora o se corta el servicio",
    body: "Detectamos un pago pendiente. Regulariza tu cuenta en las próximas 2 horas desde este enlace.",
    link: "Pagar ahora",
    realUrl: "http://amaz0n-pagos.com/login",
    evil: true,
    signals: ["Urgencia para que no pienses", "Dominio con typo: amaz0n con cero", "Te pide entrar tus datos desde el enlace"],
  },
  {
    id: "it",
    from: "Mesa de ayuda",
    realFrom: "it@tuempresa.com",
    subject: "Mantenimiento programado esta noche",
    body: "Actualizaremos los servidores de 22:00 a 23:00. No necesitas hacer nada; si ves algo raro, avísanos por el canal interno.",
    evil: false,
    signals: ["No pide nada", "No hay enlace ni urgencia", "Remitente interno verificable"],
  },
  {
    id: "jefe",
    from: "Jefe (SMS +34 600 123)",
    realFrom: "número desconocido, no guardado",
    subject: "(sin asunto)",
    body: "Estoy en reunión con dirección. Pásame YA tus accesos a la plataforma para enseñar un informe. No me llames.",
    evil: true,
    signals: ["Canal inusual: tu jefe por SMS", "Urgencia + secretismo", "Te pide tus credenciales"],
  },
];

const RETRY: Mail[] = [
  {
    id: "spear1",
    from: "Ana · Proyecto Faro",
    realFrom: "ana.faro@proyecto-faro.com",
    subject: "El documento que me pediste del Proyecto Faro",
    body: "Hola, aquí tienes el borrador con tus comentarios. Ábrelo con tu cuenta para ver los cambios.",
    link: "Abrir documento",
    realUrl: "http://proyecto-faro-docs.com/auth",
    evil: true,
    signals: ["Usa tu nombre y tu proyecto para ganarse tu confianza", "Dominio parecido pero falso", "Pide tus credenciales para entrar"],
  },
  {
    id: "spear2",
    from: "Recursos Humanos",
    realFrom: "rrhh@tuempresa-nomina.com",
    subject: "Actualiza tus datos bancarios para la nómina",
    body: "Por cambio de entidad, confirma tu cuenta antes del viernes o tu nómina se retrasa.",
    link: "Confirmar datos",
    realUrl: "http://tuempresa-nomina.com/rrhh",
    evil: true,
    signals: ["Urgencia económica", "Dominio añadido: tuempresa-nomina no es tuempresa", "Pide datos bancarios por enlace"],
  },
];

const SIGNALS_POOL = [
  "Urgencia para que no pienses",
  "Remitente que no coincide con quien dice ser",
  "Typo en el dominio",
  "Pide credenciales o datos por enlace",
  "Canal inusual para esa persona",
  "El logo se ve bonito",
];

const SOCRATIC_BANK = {
  click: {
    ask: "La escena se congela. Antes de clicar: ¿qué verificaste? Señala dónde mirarías el dominio real de ese enlace.",
    hint: "Mantén pulsado o pasa el cursor sobre el enlace SIN clicar: el destino real aparece abajo. Compara letra por letra.",
  },
  missed: {
    ask: "Lo borraste, pero nadie lo sabe. Si ese mensaje era un ataque, ¿quién protege al resto del equipo?",
    hint: "Borrar te salva a ti. Reportar salva a todos: el filtro aprende y avisa a tus compañeros.",
  },
  fp: {
    ask: "Reportaste un mensaje legítimo. ¿Qué señal te hizo dudar? ¿Cómo la verificarías por otro canal?",
    hint: "Un falso positivo no es un fracaso: es mejor dudar y verificar que clicar a ciegas. Busca el contacto oficial y pregunta.",
  },
};

type Phase = "brief" | "inbox" | "freeze" | "justify" | "debrief" | "retry" | "done";

export default function PhishingLab({ onFinish, onStatus }: GameProps) {
  const { celebrate, toast } = useFx();
  const [phase, setPhase] = useState<Phase>("brief");
  const [m, setM] = useState<Metrics>(freshMetrics);
  const [handled, setHandled] = useState<Record<string, string>>({});
  const [frozen, setFrozen] = useState<Mail | null>(null);
  const [freezeFrom, setFreezeFrom] = useState<"inbox" | "retry">("inbox");
  const [freezeKind, setFreezeKind] = useState<"click" | "missed" | "fp">("click");
  const [picked, setPicked] = useState<string[]>([]);
  const [retryHandled, setRetryHandled] = useState<Record<string, string>>({});

  const mails = phase === "retry" ? RETRY : INBOX;
  const done = Object.keys(handled).length + Object.keys(retryHandled).length;
  const total = INBOX.length + (phase === "retry" || phase === "done" ? RETRY.length : 0);

  useEffect(() => {
    onStatus(phase === "inbox" || phase === "retry" ? `Bandeja ${done}/${total}` : "");
  }, [phase, done, total, onStatus]);

  const bump = (k: keyof Metrics, n = 1) => setM((p) => ({ ...p, [k]: p[k] + n }));

  function decide(mail: Mail, action: string) {
    bump("attempts");
    const store = phase === "retry" ? setRetryHandled : setHandled;
    if (mail.evil && action === "open") {
      bump("errors");
      setFreezeFrom(phase === "retry" ? "retry" : "inbox");
      setFrozen(mail);
      setFreezeKind("click");
      setPhase("freeze");
      return;
    }
    if (mail.evil && action === "report") {
      bump("reports");
      store((p) => ({ ...p, [mail.id]: "reported" }));
      toast("Reportado. El equipo está a salvo.");
      celebrate(false);
      return;
    }
    if (mail.evil && action === "verify") {
      toast("Verificas el remitente real… algo no cuadra.");
      return;
    }
    if (mail.evil) {
      // borrar sin reportar
      bump("errors");
      setFreezeFrom(phase === "retry" ? "retry" : "inbox");
      setFrozen(mail);
      setFreezeKind("missed");
      store((p) => ({ ...p, [mail.id]: "deleted" }));
      setPhase("freeze");
      return;
    }
    if (action === "report") {
      bump("errors");
      setFreezeFrom(phase === "retry" ? "retry" : "inbox");
      setFrozen(mail);
      setFreezeKind("fp");
      store((p) => ({ ...p, [mail.id]: "reported" }));
      setPhase("freeze");
      return;
    }
    store((p) => ({ ...p, [mail.id]: action }));
  }

  const inboxDone =
    phase === "inbox" && INBOX.every((ml) => handled[ml.id] && handled[ml.id] !== "verified");
  const retryDone =
    phase === "retry" && RETRY.every((ml) => retryHandled[ml.id] === "reported");

  useEffect(() => {
    if (inboxDone) {
      const t = setTimeout(() => setPhase("justify"), 600);
      return () => clearTimeout(t);
    }
  }, [inboxDone]);

  useEffect(() => {
    if (retryDone) {
      const t = setTimeout(() => setPhase("done"), 600);
      return () => clearTimeout(t);
    }
  }, [retryDone]);

  if (phase === "brief") {
    return (
      <Brief
        title="Reconoce · Resiste · Reporta"
        time="5 min"
        points={[
          "Remitente real ≠ nombre visible: mira la dirección completa.",
          "Mantén pulsado el enlace para ver el destino. Busca typos letra por letra.",
          "Urgencia + premio + amenaza = pausa obligatoria. Verifica por otro canal.",
        ]}
        startLabel="Abrir la bandeja"
        onStart={() => setPhase("inbox")}
      />
    );
  }

  if (phase === "freeze" && frozen) {
    const turn = socratic(freezeKind, SOCRATIC_BANK);
    return (
      <>
        <div className="lab-card frozen">
          <p className="lab-kicker">Escena congelada · protocolo CISA</p>
          <p className="mail-subject">{frozen.subject}</p>
          <p className="mail-meta">
            Dice ser: {frozen.from}
            <br />
            Remitente real: <code>{frozen.realFrom}</code>
          </p>
          {frozen.realUrl && (
            <p className="mail-meta">
              El enlace lleva a: <code>{frozen.realUrl}</code> (copiado como texto, sin clicar)
            </p>
          )}
          <ol className="protocol">
            <li>Copia la URL como texto plano. Nunca cliques para “comprobar”.</li>
            <li>Teclea tú el sitio oficial en el navegador.</li>
            <li>Reporta con el botón de reporte y borra el mensaje.</li>
          </ol>
        </div>
        <Socratic
          ask={turn.ask}
          hint={turn.hint}
          actionLabel="Aplico el protocolo"
          onNext={() => {
            setFrozen(null);
            setPhase(freezeFrom);
            if (freezeKind === "click" || freezeKind === "missed") {
              (freezeFrom === "retry" ? setRetryHandled : setHandled)((p) => ({
                ...p,
                [frozen.id]: "reported",
              }));
              bump("reports");
            }
          }}
        />
      </>
    );
  }

  if (phase === "justify") {
    const correct = picked.filter((s) =>
      INBOX.flatMap((ml) => ml.signals).includes(s),
    ).length;
    return (
      <div className="lab-card">
        <p className="lab-kicker">Debrief · tu cadena de error</p>
        <h3>Marca las 3 señales que viste en los mensajes malignos</h3>
        <div className="pick-grid">
          {SIGNALS_POOL.map((s) => (
            <button
              key={s}
              type="button"
              className={`tile${picked.includes(s) ? " selected" : ""}`}
              onClick={() =>
                setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : p.length < 3 ? [...p, s] : p))
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
            disabled={picked.length !== 3}
            onClick={() => {
              if (correct === 3) {
                celebrate(true);
                setPhase(m.errors === 0 ? "done" : "debrief");
              } else {
                toast(`Viste ${correct}/3. Repasa y reintenta.`);
                setPicked([]);
              }
            }}
          >
            Verbalizo mi defensa ({picked.length}/3)
          </button>
        </div>
      </div>
    );
  }

  if (phase === "debrief") {
    return (
      <div className="lab-card">
        <p className="lab-kicker">Tu cadena de error, reconstruida</p>
        <h3>Urgencia → confianza en el nombre → sin hover</h3>
        <p>
          Es el patrón clásico del reincidente. Ahora viene la variante difícil: spear-phishing
          con tu nombre y tu proyecto. Apruebas si reportas 2/2 sin un solo clic.
        </p>
        <div className="btn-row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              bump("retries");
              setPhase("retry");
            }}
          >
            Acepto el reintento
          </button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const stars = grade(m.errors, m.retries);
    return (
      <ReportCard
        title="Isla del Phishing · métricas NIST"
        rows={[
          { label: "Clics en malignos", value: String(m.errors) },
          { label: "Reportes", value: `${m.reports}/${INBOX.filter((x) => x.evil).length + (m.retries ? RETRY.length : 0)}` },
          { label: "Reintentos", value: String(m.retries) },
        ]}
        stars={stars}
        verdict={
          stars === 3
            ? "0 clics + 100% reporte + 3 señales. Conducta corregida."
            : "Aprobado en variante nueva. Si fallas 2 veces, el tutor alarga la ruta: más andamiaje, menos dificultad, nunca castigo."
        }
        onDone={() => onFinish(stars)}
      />
    );
  }

  return (
    <>
      <Dots total={mails.length} current={done} />
      <p className="hint">
        {phase === "retry"
          ? "Variante difícil: spear-phishing con tu nombre. Reporta 2/2 sin clicar."
          : "Decide por cada mensaje: abrir, reportar, borrar o verificar por otro canal."}
      </p>
      <div className="inbox">
        {mails.map((mail) => {
          const state = phase === "retry" ? retryHandled[mail.id] : handled[mail.id];
          if (state === "reported" || state === "deleted" || state === "open") {
            return (
              <div key={mail.id} className={`mail done-${state}`}>
                <p className="mail-subject">{mail.subject}</p>
                <p className="mail-state">
                  {state === "reported" ? "Reportado ✓" : state === "deleted" ? "Borrado" : "Abierto"}
                </p>
              </div>
            );
          }
          return (
            <div key={mail.id} className="mail">
              <p className="mail-from">
                {mail.from} <span>&lt;{mail.realFrom}&gt;</span>
              </p>
              <p className="mail-subject">{mail.subject}</p>
              <p className="mail-body">{mail.body}</p>
              {mail.link && <p className="mail-link">[{mail.link}]</p>}
              <div className="mail-actions">
                <button type="button" className="btn btn-ghost" onClick={() => decide(mail, "open")}>
                  Abrir
                </button>
                <button type="button" className="btn btn-primary" onClick={() => decide(mail, "report")}>
                  Reportar
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => decide(mail, "delete")}>
                  Borrar
                </button>
                <button type="button" className="btn btn-listen" onClick={() => decide(mail, "verify")}>
                  Verificar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
