// utils/subtitlePref.ts
export const ccKey = (courseId: number | string) => `cs:cc:${courseId}`;

export function saveCC(courseId: number | string, lang: string) {
  try { localStorage.setItem(ccKey(courseId), lang); } catch {}
}

export function loadCC(courseId: number | string) {
  try { return localStorage.getItem(ccKey(courseId)) || "off"; } catch { return "off"; }
}