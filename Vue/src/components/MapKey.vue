<script setup>
import { ref } from 'vue';
import { NARROW_SCREEN_WIDTH, NODE_TYPES, STORAGE_KEYS } from '../constants.js';
import { useColorScheme } from '../composables/useColorScheme.js';
import { readStorage, writeStorage } from '../utils/storage.js';

const colors = useColorScheme();

// Keep the user's own choice. Without one, start collapsed on phones,
// where the open Key would cover the map.
const saved = readStorage(STORAGE_KEYS.keyCollapsed);
const collapsed = ref(saved !== null ? saved === 'true' : window.innerWidth < NARROW_SCREEN_WIDTH);

function toggle() {
  collapsed.value = !collapsed.value;
  writeStorage(STORAGE_KEYS.keyCollapsed, String(collapsed.value));
}
</script>

<template>
  <aside class="legend" :class="{ collapsed }" aria-label="Key">
    <button
      type="button"
      class="legend-toggle"
      :aria-expanded="String(!collapsed)"
      @click="toggle"
    >Key {{ collapsed ? '▴' : '▾' }}</button>
    <ul v-if="!collapsed">
      <li v-for="(info, type) in NODE_TYPES" :key="type">
        <span class="swatch" :style="{ backgroundColor: colors.nodeColors[type] }"></span>
        <span><strong>{{ info.name }}</strong>: {{ info.keyMeaning }}</span>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.legend {
  position: fixed;
  right: 12px;
  bottom: 12px;
  width: 290px;
  max-width: calc(100vw - 24px);
  box-sizing: border-box;
  padding: 8px 12px 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background-color: rgba(23, 28, 38, 0.95);
  color: #e5e7eb;
  font-size: 13px;
  text-align: left;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 98;
}

.legend.collapsed {
  width: auto;
  padding: 4px 8px;
}

.legend-toggle {
  margin: 0;
  padding: 2px 0;
  border: none;
  background: none;
  color: #ccc;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
}

.legend-toggle:hover,
.legend-toggle:focus-visible {
  color: white;
}

ul {
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
}

li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
  line-height: 1.4;
}
</style>
