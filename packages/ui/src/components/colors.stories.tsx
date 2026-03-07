import type { Meta } from "@storybook/react";
import { colors, trackColors } from "../tokens/colors";

const meta: Meta = {
  title: "Design System/Colors",
  parameters: { backgrounds: { default: "dark", values: [{ name: "dark", value: "#0d0d0f" }] } },
};

export default meta;

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 48, height: 48, borderRadius: 8,
          background: value,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      />
      <span style={{ color: "#9ca3af", fontSize: 10, fontFamily: "monospace" }}>{name}</span>
      <span style={{ color: "#6b7280", fontSize: 9, fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}

export const StudioScale = {
  name: "Studio Scale",
  render: () => (
    <div style={{ padding: 24 }}>
      <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 16, fontFamily: "sans-serif" }}>
        Studio neutrals — dark backgrounds used throughout the DAW UI
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {Object.entries(colors.studio).map(([key, val]) => (
          <Swatch key={key} name={`studio.${key}`} value={val} />
        ))}
      </div>
    </div>
  ),
};

export const AccentColors = {
  name: "Accent Colors",
  render: () => (
    <div style={{ padding: 24 }}>
      <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 16, fontFamily: "sans-serif" }}>
        Accent colors — used for interactive elements, status indicators, and highlights
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {Object.entries(colors.accent).map(([key, val]) => (
          <Swatch key={key} name={`accent.${key}`} value={val} />
        ))}
      </div>
    </div>
  ),
};

export const TrackColors = {
  name: "Track Colors",
  render: () => (
    <div style={{ padding: 24 }}>
      <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 16, fontFamily: "sans-serif" }}>
        Track color palette — cycled when creating new tracks
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {trackColors.map((val, i) => (
          <Swatch key={i} name={`track[${i}]`} value={val} />
        ))}
      </div>
    </div>
  ),
};

export const ColorSystemOverview = {
  name: "Full Overview",
  render: () => (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Studio scale gradient band */}
      <div>
        <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 8, fontFamily: "sans-serif" }}>
          Studio scale — light to dark
        </p>
        <div style={{ display: "flex", height: 32, borderRadius: 8, overflow: "hidden" }}>
          {Object.values(colors.studio).reverse().map((v, i) => (
            <div key={i} style={{ flex: 1, background: v }} />
          ))}
        </div>
      </div>

      {/* Accent stripe */}
      <div>
        <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 8, fontFamily: "sans-serif" }}>
          Accent palette
        </p>
        <div style={{ display: "flex", height: 32, borderRadius: 8, overflow: "hidden" }}>
          {Object.values(colors.accent).map((v, i) => (
            <div key={i} style={{ flex: 1, background: v }} />
          ))}
        </div>
      </div>

      {/* Track stripe */}
      <div>
        <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 8, fontFamily: "sans-serif" }}>
          Track palette
        </p>
        <div style={{ display: "flex", height: 32, borderRadius: 8, overflow: "hidden" }}>
          {trackColors.map((v, i) => (
            <div key={i} style={{ flex: 1, background: v }} />
          ))}
        </div>
      </div>
    </div>
  ),
};
