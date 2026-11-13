// Colour helpers based on the WCAG 2 contrast formula.

// Relative luminance of a "#RRGGBB" colour, or null if it cannot be read
export function getLuminance(hex) {
  const value = parseInt(String(hex).replace('#', ''), 16);
  if (Number.isNaN(value)) {
    return null;
  }
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map(channel => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

// Contrast ratio between two colours, from 1 (none) to 21 (black on white)
export function getContrastRatio(hexA, hexB) {
  const a = getLuminance(hexA);
  const b = getLuminance(hexB);
  if (a === null || b === null) {
    return null;
  }
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// Returns the text colour if it can be read on the background. Otherwise
// returns black or white, whichever is easier to read.
export function readableTextColor(background, text, minimumRatio = 3) {
  const ratio = getContrastRatio(background, text);
  if (ratio !== null && ratio >= minimumRatio) {
    return text;
  }
  const onBlack = getContrastRatio(background, '#000000') || 0;
  const onWhite = getContrastRatio(background, '#FFFFFF') || 0;
  return onBlack >= onWhite ? '#000000' : '#FFFFFF';
}

// True for light colours, where dark text or marks are easier to see
export function isLightColor(hex) {
  const luminance = getLuminance(hex);
  return luminance !== null && luminance > 0.4;
}
