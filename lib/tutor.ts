/**
 * Seam de tutoria IA.
 *
 * Hoy: motor local determinista (preguntas socraticas, variantes y rubrica
 * guionizadas por isla). La forma ya es la del adaptador futuro:
 *   ask(error) -> pregunta socratica + pista progresiva
 *   variant(level) -> reintento mas dificil del mismo error
 *   grade(metrics) -> estrellas NIST (intentos, errores, reportes)
 * Manana: cambiar el cuerpo de estas funciones por llamadas al modelo sin
 * tocar ningun lab. Nada se envia a ningun servidor: todo ocurre en local.
 */
export type TutorTurn = { ask: string; hint: string };

const FALLBACK: TutorTurn = {
  ask: "¿Qué verificaste antes de actuar? Señala exactamente dónde mirarías.",
  hint: "Fíjate en el remitente real, el dominio letra por letra y la urgencia.",
};

export function socratic(key: string, bank: Record<string, TutorTurn>): TutorTurn {
  return bank[key] ?? FALLBACK;
}

/** Estrellas NIST: solo el reintento limpio en variante nueva aprueba con nota. */
export function grade(errors: number, retries: number): 1 | 2 | 3 {
  if (errors === 0) return 3;
  return retries === 0 ? 2 : 1;
}

export type Metric = { label: string; value: string };

/** Metricas por isla: cada lab las lleva en useState (intentos, errores, reportes). */
export type Metrics = { attempts: number; errors: number; reports: number; retries: number };

export const freshMetrics = (): Metrics => ({ attempts: 0, errors: 0, reports: 0, retries: 0 });
