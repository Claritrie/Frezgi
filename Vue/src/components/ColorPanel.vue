<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { NODE_TYPES } from '../constants.js';
import { useColorScheme } from '../composables/useColorScheme.js';
import { version } from '../../package.json';

const colors = useColorScheme();

const PANEL_WIDTH = 210;
// The panel opens when the pointer comes this close to the left edge
const OPEN_ZONE = 50;
// and closes shortly after the pointer moves this far away
const CLOSE_DISTANCE = 300;

const isOpen = ref(false);
let hideTimer = null;

function clearHideTimer() {
  clearTimeout(hideTimer);
  hideTimer = null;
}

function handleMouseMove(event) {
  if (event.clientX <= OPEN_ZONE) {
    isOpen.value = true;
    clearHideTimer();
  } else if (isOpen.value && event.clientX > CLOSE_DISTANCE && !hideTimer) {
    hideTimer = setTimeout(() => {
      isOpen.value = false;
      hideTimer = null;
    }, 100);
  }
}

function toggle() {
  isOpen.value = !isOpen.value;
  clearHideTimer();
}

onMounted(() => document.addEventListener('mousemove', handleMouseMove));
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  clearHideTimer();
});
</script>

<template>
  <div class="color-settings-panel" :class="{ hidden: !isOpen }" :inert="!isOpen" id="color-settings" :style="{ width: PANEL_WIDTH + 'px' }">
    <div class="panel-logo">
      <div class="panel-brand">
        <img src="https://imgur.com/dlnsBR8.png" alt="Frezgi Logo" class="company-logo">
        <span class="panel-byline">by Claritrie</span>
      </div>
    </div>

    <div class="color-picker-container">
      <div class="color-picker-row">
        <label for="canvas-color" class="row-label canvas-label">Canvas:</label>
        <input id="canvas-color" v-model="colors.canvasColor" type="color" class="color-input" />
      </div>

      <div class="color-picker-section">
        <h4>Node/Text Colors</h4>
        <div v-for="(info, type) in NODE_TYPES" :key="type" class="color-picker-row">
          <span class="row-label">{{ info.panelLabel }}:</span>
          <div class="color-inputs">
            <input
              :id="`bg-${type}`"
              v-model="colors.nodeColors[type]"
              type="color"
              class="color-input"
              :title="`${info.panelLabel} background`"
              :aria-label="`${info.panelLabel} background`"
              @change="colors.ensureReadableText(type)"
            />
            <input
              :id="`text-${type}`"
              v-model="colors.textColors[type]"
              type="color"
              class="color-input"
              :title="`${info.panelLabel} text`"
              :aria-label="`${info.panelLabel} text`"
              @change="colors.ensureReadableText(type)"
            />
          </div>
        </div>
        <button type="button" class="reset-btn" @click="colors.reset()">Reset Colors</button>
      </div>
    </div>

    <div class="version-info">v{{ version }}</div>
  </div>

  <button
    type="button"
    class="toggle-panel-btn"
    :class="{ 'panel-open': isOpen }"
    :style="{ left: isOpen ? PANEL_WIDTH + 'px' : 0 }"
    :aria-label="isOpen ? 'Close the colour panel' : 'Open the colour panel'"
    :aria-expanded="isOpen"
    aria-controls="color-settings"
    @click="toggle"
  >{{ isOpen ? '◀' : '▶' }}</button>
</template>

<style scoped>
.color-settings-panel {
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding: 12px;
  overflow-y: auto;
  background-color: rgba(23, 28, 38, 0.97);
  color: #e5e7eb;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease;
  z-index: 100;
}

.color-settings-panel.hidden {
  transform: translateX(-100%);
}

.panel-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
  padding: 10px 5px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* The byline lines up with the right edge of the logo */
.panel-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 100%;
}

.company-logo {
  display: block;
  max-width: 100%;
  max-height: 60px;
}

.panel-byline {
  margin-top: 4px;
  font-size: 12px;
  letter-spacing: 0.03em;
  color: #9ca3af;
}

.color-picker-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
  margin: 5px 0;
  overflow-y: auto;
}

.color-picker-section h4 {
  margin: 5px 0;
  padding-bottom: 3px;
  font-size: 13px;
  color: #d1d5db;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.color-picker-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.row-label {
  flex: 1;
  font-size: 13px;
}

.canvas-label {
  margin-right: 5px;
  text-align: left;
}

.color-inputs {
  display: flex;
  gap: 5px;
}

.color-input {
  appearance: none;
  -webkit-appearance: none;
  width: 32px;
  height: 32px;
  flex: none;
  margin: 10px 0;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: none;
  cursor: pointer;
}

/* Reset the native inset border as well as the input's outer border. */
.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

.color-input::-moz-color-swatch {
  border: none;
  border-radius: 6px;
}

.color-input:focus-visible,
.toggle-panel-btn:focus-visible {
  outline: 2px solid #93c5fd;
  outline-offset: 3px;
}

.reset-btn {
  width: 100%;
  margin: 8px 0 0;
  padding: 8px 10px;
  border: none;
  border-radius: 6px;
  background-color: #374151;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-btn:hover,
.reset-btn:focus-visible {
  background-color: #4b5563;
}

.version-info {
  margin-top: 5px;
  padding-top: 5px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 11px;
  color: #9ca3af;
}

.toggle-panel-btn {
  position: fixed;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 60px;
  margin: 5px;
  padding: 0;
  transform: translateY(-50%);
  border: none;
  border-radius: 0 6px 6px 0;
  background-color: rgba(55, 65, 81, 0.85);
  color: white;
  cursor: pointer;
  transition: left 0.3s ease;
  z-index: 99;
}
</style>
