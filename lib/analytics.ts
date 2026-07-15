declare global {
  interface Window {
    gtag?: (command: "event", name: string, parameters?: Record<string, string | number | boolean>) => void;
  }
}
export function track(name: string, parameters: Record<string, string | number | boolean> = {}) {
  if (typeof window !== "undefined") window.gtag?.("event", name, parameters);
}