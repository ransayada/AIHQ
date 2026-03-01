export const colors = {
  studio: {
    950: "#070709",
    900: "#0d0d0f",
    800: "#111115",
    700: "#17171d",
    600: "#1e1e27",
    500: "#26262f",
    400: "#32323d",
    300: "#44444f",
    200: "#7a7a8a",
    100: "#aaaabb",
    50: "#d4d4e0",
  },
  accent: {
    purple: "#7c4dff",
    purpleDim: "#5533bb",
    cyan: "#00d4ff",
    cyanDim: "#0099bb",
    green: "#00e676",
    greenDim: "#00aa55",
    orange: "#ff6d00",
    red: "#ff1744",
    yellow: "#ffea00",
    pink: "#f50057",
  },
} as const;

// Track color palette (cycled when creating new tracks)
export const trackColors = [
  "#7c4dff", // purple
  "#00d4ff", // cyan
  "#00e676", // green
  "#ff6d00", // orange
  "#f50057", // pink
  "#ffea00", // yellow
  "#1de9b6", // teal
  "#ff4081", // rose
  "#64dd17", // lime
  "#00b0ff", // light blue
] as const;

export function getTrackColor(index: number): string {
  return trackColors[index % trackColors.length] ?? trackColors[0];
}
