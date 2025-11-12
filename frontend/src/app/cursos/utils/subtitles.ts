// utils/subtitles.ts
export type SubtitleSelection = "off" | string;

export const ccKey = (courseId: number | string) => `cs:cc:${courseId}`;

export function saveCC(courseId: number | string, value: SubtitleSelection) {
  try { localStorage.setItem(ccKey(courseId), value); } catch {}
}

export function loadCC(courseId: number | string): SubtitleSelection {
  try {
    const v = localStorage.getItem(ccKey(courseId));
    return (v as SubtitleSelection) ?? "off";
  } catch { return "off"; }
}

/** Parser mínimo de WebVTT (simple, pero funcional para cues básicos) */
function parseVTT(vtt: string): Array<{ start: number; end: number; text: string }> {
  const lines = vtt.split(/\r?\n/);
  const cues: Array<{ start: number; end: number; text: string }> = [];
  let i = 0;
  // omite "WEBVTT" y comentarios
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line || /^WEBVTT/i.test(line) || line.startsWith("NOTE")) { i++; continue; }
    // posible cue-id
    let timeLine = line;
    if (!line.includes("-->")) { i++; timeLine = (lines[i] || "").trim(); }
    if (!timeLine.includes("-->")) { i++; continue; }
    const [a, b] = timeLine.split("-->").map(s => s.trim());
    const toSec = (t: string) => {
      // hh:mm:ss.mmm | mm:ss.mmm
      const m = t.match(/(?:(\d+):)?(\d+):(\d+)\.(\d+)/);
      if (!m) return 0;
      const h = Number(m[1] || 0), m2 = Number(m[2]), s = Number(m[3]), ms = Number(m[4]);
      return h * 3600 + m2 * 60 + s + ms / 1000;
    };
    const start = toSec(a);
    const end = toSec(b);

    const textLines: string[] = [];
    i++;
    while (i < lines.length && lines[i].trim() !== "") {
      textLines.push(lines[i]);
      i++;
    }
    cues.push({ start, end, text: textLines.join("\n") });
    // avanza el separador en blanco
    i++;
  }
  return cues;
}

/** Fallback: descarga el VTT y lo inyecta como TextTrack manual */
async function fetchAndInjectTrack(video: HTMLVideoElement, trackEl: HTMLTrackElement, label: string, lang: string) {
  const url = trackEl.src;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`VTT fetch ${res.status}`);
  const vttText = await res.text();
  const cues = parseVTT(vttText);

  const manual = video.addTextTrack("subtitles", label || lang.toUpperCase(), lang || "");
  manual.mode = "showing";
  for (const c of cues) {
    try {
      const cue = new VTTCue(c.start, c.end, c.text);
      manual.addCue(cue);
    } catch {
      // Safari antiguo: WebKitTextTrackCue
      // @ts-ignore
      const cue = new (window as any).TextTrackCue(c.start, c.end, c.text);
      manual.addCue(cue);
    }
  }
}

/** Selecciona/activa subtítulos y, si fallan, usa el fallback */
export async function applyTextTrackSelection(video: HTMLVideoElement, selection: SubtitleSelection) {
  if (!video) return;

  const textTracks = Array.from(video.textTracks ?? []);
  const trackEls = Array.from(video.querySelectorAll('track[kind="subtitles"]')) as HTMLTrackElement[];

  // desactiva todo
  textTracks.forEach(t => (t.mode = "disabled"));
  trackEls.forEach(el => (el.default = false));

  if (selection === "off") return;

  const norm = selection.toLowerCase();
  const pickIndex = trackEls.findIndex((el) => {
    const lang = (el.srclang || el.getAttribute("srcLang") || "").toLowerCase();
    const label = (el.label || "").toLowerCase();
    return lang.startsWith(norm) || label.includes(norm);
  });
  if (pickIndex < 0) return;

  const pickedEl = trackEls[pickIndex];
  const pickedText = textTracks[pickIndex];
  if (!pickedText) return;

  pickedEl.default = true;

  const tryNative = () => {
    pickedText.mode = "hidden";
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    pickedText.cues && pickedText.cues.length;
    pickedText.mode = "showing";
  };

  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

  // Intentos nativos rápidos
  tryNative();
  await wait(80);
  tryNative();

  // Si ya hay cues visibles, terminamos
  if ((pickedEl as any).readyState === 2 && (pickedText.cues?.length ?? 0) > 0) return;

  // Espera a que cargue/añada tracks
  await wait(200);
  tryNative();
  if ((pickedEl as any).readyState === 2 && (pickedText.cues?.length ?? 0) > 0) return;

  // Si el readyState indica ERROR (3) o no hay cues tras varios intentos → fallback manual
  const rs = (pickedEl as any).readyState;
  if (rs === 3 || (pickedText.cues?.length ?? 0) === 0) {
    try {
      await fetchAndInjectTrack(video, pickedEl, pickedEl.label, pickedEl.srclang || "");
      return;
    } catch (e) {
      console.warn("Fallback VTT injection failed:", e);
    }
  }

  // Último “nudge” por si el UA es perezoso
  await wait(120);
  tryNative();
}