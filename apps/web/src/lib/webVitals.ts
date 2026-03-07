/**
 * Web Vitals reporting — free, zero-dependency performance observability.
 *
 * Metrics reported:
 *   CLS  — Cumulative Layout Shift       (visual stability)
 *   FID  — First Input Delay             (interactivity)
 *   FCP  — First Contentful Paint        (loading)
 *   LCP  — Largest Contentful Paint      (loading)
 *   TTFB — Time to First Byte            (server response)
 *
 * In production, swap the console.log with a POST to /logs or your
 * analytics endpoint (Plausible, PostHog, etc.)
 */

type MetricName = "CLS" | "FID" | "FCP" | "LCP" | "TTFB" | "INP";

interface Metric {
  name: MetricName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
}

export function reportWebVitals(metric: Metric): void {
  if (process.env.NODE_ENV === "development") {
    const color = metric.rating === "good" ? "#22c55e" : metric.rating === "needs-improvement" ? "#f59e0b" : "#ef4444";
    console.log(
      `%c[WebVitals] ${metric.name}: ${metric.value.toFixed(1)}ms (${metric.rating})`,
      `color: ${color}; font-weight: bold`
    );
    return;
  }

  // Production: batch-send to your analytics endpoint
  if (typeof window === "undefined") return;

  const body = JSON.stringify({
    name:   metric.name,
    value:  metric.value,
    rating: metric.rating,
    delta:  metric.delta,
    id:     metric.id,
    page:   window.location.pathname,
    ts:     Date.now(),
  });

  // Use sendBeacon for reliability on page unload; fall back to fetch
  const url = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/logs/vitals`
    : "/logs/vitals";

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
  } else {
    void fetch(url, { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
  }
}
