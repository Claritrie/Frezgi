import { reactive, ref, watch } from 'vue';
import { DEFAULT_COLORS, STORAGE_KEYS } from '../constants.js';
import { readableTextColor } from '../utils/color.js';
import { readStorage, writeStorage } from '../utils/storage.js';

let scheme = null;

// The user's colour choices for the canvas and each type of box. They are
// saved in the browser and loaded again on the next visit. All components
// share one scheme, so a change in the colour panel shows everywhere.
export function useColorScheme() {
  if (!scheme) {
    scheme = createColorScheme();
  }
  return scheme;
}

function createColorScheme() {
  const canvasColor = ref(DEFAULT_COLORS.canvas);
  const nodeColors = reactive({ ...DEFAULT_COLORS.nodeColors });
  const textColors = reactive({ ...DEFAULT_COLORS.textColors });

  // If a text colour is too close to its box colour, replace it with black
  // or white, whichever is easier to read
  function ensureReadableText(type) {
    textColors[type] = readableTextColor(nodeColors[type], textColors[type]);
  }

  function load() {
    const saved = readStorage(STORAGE_KEYS.colorScheme);
    if (!saved) {
      return;
    }
    try {
      const scheme = JSON.parse(saved);
      if (scheme.canvas) {
        canvasColor.value = scheme.canvas;
      }
      for (const type in nodeColors) {
        if (scheme.nodeColors && scheme.nodeColors[type]) {
          nodeColors[type] = scheme.nodeColors[type];
        }
        if (scheme.textColors && scheme.textColors[type]) {
          textColors[type] = scheme.textColors[type];
        }
        ensureReadableText(type);
      }
    } catch (error) {
      console.error('Failed to load the colour scheme:', error);
    }
  }

  function save() {
    writeStorage(STORAGE_KEYS.colorScheme, JSON.stringify({
      canvas: canvasColor.value,
      nodeColors,
      textColors,
    }));
  }

  function reset() {
    canvasColor.value = DEFAULT_COLORS.canvas;
    Object.assign(nodeColors, DEFAULT_COLORS.nodeColors);
    Object.assign(textColors, DEFAULT_COLORS.textColors);
  }

  load();
  // Save every change, including the canvas colour
  watch([canvasColor, nodeColors, textColors], save, { deep: true });

  // reactive() unwraps the refs, so that components can read and set them directly
  return reactive({ canvasColor, nodeColors, textColors, ensureReadableText, reset });
}
