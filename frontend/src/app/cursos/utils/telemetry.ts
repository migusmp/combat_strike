// utils/telemetry.ts
export type HlsLog = {
  level: "warn" | "error";
  detail?: string;
  data?: any;
};

export function logHls(event: HlsLog) {
  if (process.env.NODE_ENV !== "production") {
    const tag = event.level === "error" ? "❌" : "⚠️";
    console[event.level === "error" ? "error" : "warn"](`${tag} HLS`, event.detail, event.data);
    return;
  }

  // Producción: manda a tu endpoint de logs si quieres
  try {
    fetch("/api/logs/hls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        ts: Date.now(),
        ...event,
      }),
    }).catch(() => {});
  } catch {}
}