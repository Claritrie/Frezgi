<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import CoachTip from './components/CoachTip.vue';
import ColorPanel from './components/ColorPanel.vue';
import MapCanvas from './components/MapCanvas.vue';
import MapKey from './components/MapKey.vue';
import PointDialog from './components/PointDialog.vue';
import WelcomeGuide from './components/WelcomeGuide.vue';
import { NODE_WIDTH, STORAGE_KEYS } from './constants.js';
import { useArgumentMap } from './composables/useArgumentMap.js';
import { readStorage, writeStorage } from './utils/storage.js';

const map = useArgumentMap();
const canvas = ref(null);

// Welcome guide: shown on the first visit, and from the "?" button
const showGuide = ref(readStorage(STORAGE_KEYS.guideSeen) !== 'true');

function closeGuide() {
  showGuide.value = false;
  writeStorage(STORAGE_KEYS.guideSeen, 'true');
}

// Dialog for adding or editing a box:
// { mode: 'add', type, parent } or { mode: 'edit', node }
const dialog = ref(null);

const dialogProps = computed(() => {
  const d = dialog.value;
  if (d.mode === 'add') {
    return { mode: 'add', type: d.type, parentText: d.parent.text };
  }
  // The resolution dialog starts empty instead of showing the placeholder text
  const isUnwrittenResolution = d.node === map.resolution && !map.resolutionIsSet;
  return {
    mode: 'edit',
    type: d.node.type,
    initialText: isUnwrittenResolution ? '' : d.node.text,
  };
});

function openAddDialog({ type, parent }) {
  dialog.value = { mode: 'add', type, parent };
}

function openEditDialog(node) {
  dialog.value = { mode: 'edit', node };
}

function saveDialog(text) {
  const d = dialog.value;
  if (d.mode === 'add') {
    const position = canvas.value.findFreePosition(d.parent);
    map.addPoint({ parent: d.parent, type: d.type, text, position });
  } else {
    map.setText(d.node, text);
  }
  dialog.value = null;
}

// First-map tips for new users. The first two steps (write the resolution,
// add a reason) are taught by the hint under the main box, for everyone.
const tutorialDone = ref(readStorage(STORAGE_KEYS.tutorialDone) === 'true');

const tutorialStep = computed(() => {
  if (tutorialDone.value || showGuide.value || dialog.value) {
    return null;
  }
  if (!map.resolutionIsSet || map.points.length === 0) {
    return null;
  }
  return map.hasReplyToPoint ? 'done' : 'challenge';
});

function finishTutorial() {
  tutorialDone.value = true;
  writeStorage(STORAGE_KEYS.tutorialDone, 'true');
}

function handleKeydown(event) {
  if (event.key !== 'Escape' || (!dialog.value && !showGuide.value)) {
    // Not used by the app; leave Escape to the browser (for example,
    // so that it can still exit full screen)
    return;
  }
  // Mark the key as handled. Without this, Safari on macOS also uses
  // Escape to take the window out of full screen (issue #10).
  event.preventDefault();
  if (dialog.value) {
    dialog.value = null;
  } else {
    closeGuide();
  }
}

onMounted(() => {
  // Centre the main box so that it is on screen at any width, including phones
  map.moveNode(map.resolution, {
    x: Math.max(16, Math.round((window.innerWidth - NODE_WIDTH) / 2)),
    y: map.resolution.position.y,
  });
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <div class="app">
    <ColorPanel />

    <button
      type="button"
      class="help-btn"
      aria-label="Open the guide"
      title="What is Frezgi and how do I use it?"
      @click="showGuide = true"
    >?</button>

    <MapKey />
    <CoachTip v-if="tutorialStep" :step="tutorialStep" @finish="finishTutorial" />
    <WelcomeGuide v-if="showGuide" @close="closeGuide" />

    <MapCanvas
      ref="canvas"
      :map="map"
      :dialog-open="!!dialog"
      :show-hint="!showGuide"
      @edit="openEditDialog"
      @add="openAddDialog"
    />

    <PointDialog v-if="dialog" v-bind="dialogProps" @save="saveDialog" @cancel="dialog = null" />
  </div>
</template>

<style scoped>
.help-btn {
  position: fixed;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: rgba(55, 65, 81, 0.9);
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  z-index: 99;
}

.help-btn:hover,
.help-btn:focus-visible {
  background-color: #2563eb;
}
</style>
