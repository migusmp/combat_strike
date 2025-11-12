// Guarda / carga selección de subtítulos por curso
export type SubtitleSelection = "off" | string; // p.ej. "es", "en", o etiqueta

export const ccKey = (courseId: number | string) => `cs:cc:${courseId}`;

export function saveCC(courseId: number | string, value: SubtitleSelection) {
  try {
    localStorage.setItem(ccKey(courseId), value);
  } catch {}
}

export function loadCC(courseId: number | string): SubtitleSelection {
  try {
    const v = localStorage.getItem(ccKey(courseId));
    return (v as SubtitleSelection) ?? "off";
  } catch {
    return "off";
  }
}

/**
 * Aplica la pista de subtítulos en el <video>.
 * - selected: "off" o código/etiqueta (lang/label) a activar.
 * - Intenta matchear por `TextTrack.language` o por `TextTrack.label`.
 */
export function applyTextTrackSelection(
  videoEl: HTMLVideoElement,
  selected: SubtitleSelection
) {
  const list = videoEl.textTracks;
  if (!list) return;

  // Primero desactivar todo
  for (let i = 0; i < list.length; i++) {
    list[i].mode = "disabled";
  }
  if (selected === "off") return;

  const want = selected.toLowerCase();
  // Buscar por language o label
  for (let i = 0; i < list.length; i++) {
    const tr = list[i];
    const lang = (tr.language ?? "").toLowerCase();
    const label = (tr.label ?? "").toLowerCase();
    if (lang === want || label === want) {
      tr.mode = "showing";
      return;
    }
  }
  // Si no hay match exacto, intenta "es" empieza por, etc.
  for (let i = 0; i < list.length; i++) {
    const tr = list[i];
    const lang = (tr.language ?? "").toLowerCase();
    if (lang.startsWith(want)) {
      tr.mode = "showing";
      return;
    }
  }
}