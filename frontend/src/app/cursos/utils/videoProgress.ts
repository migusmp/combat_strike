export const timeKey = (courseId: number | string, sectionSlug?: string, classSlug?: string) =>
  `cs:time:${courseId}:${sectionSlug ?? "root"}:${classSlug ?? "root"}`;

export function saveTime(key: string, t: number) {
  try { sessionStorage.setItem(key, String(Math.floor(t))); } catch {}
}

export function loadTime(key: string) {
  try { return Number(sessionStorage.getItem(key) ?? "0") || 0; } catch { return 0; }
}