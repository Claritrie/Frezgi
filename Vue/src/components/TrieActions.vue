<script setup>
import { ref } from 'vue';
import { useColorScheme } from '../composables/useColorScheme.js';
import { exportTriePng } from '../utils/exportPng.js';

const props = defineProps({ map: { type: Object, required: true } });
const colors = useColorScheme();
const background = ref(true);
const exporting = ref(false);
const message = ref('');

function startNew() {
  if ((props.map.resolutionIsSet || props.map.points.length) &&
      !window.confirm('Start a new trie? This replaces the trie saved on this device. Export a PNG first if you want to keep an image of it.')) return;
  props.map.newTrie();
  message.value = '';
}

async function exportPng() {
  exporting.value = true;
  message.value = '';
  try {
    await exportTriePng(props.map, colors, background.value);
    message.value = 'PNG exported';
  } catch (error) {
    message.value = error.message;
  } finally {
    exporting.value = false;
  }
}
</script>

<template>
  <section class="trie-actions" aria-label="Trie">
    <div class="controls">
      <button type="button" @click="startNew">New trie</button>
      <button type="button" :disabled="exporting" @click="exportPng">{{ exporting ? 'Exporting…' : 'Export PNG' }}</button>
      <label><input v-model="background" type="checkbox" /> Include background</label>
    </div>
    <p role="status">{{ message || map.saveStatus || 'Your trie saves automatically on this device' }}</p>
  </section>
</template>

<style scoped>
.trie-actions {
  position: fixed;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  width: max-content;
  max-width: calc(100% - 32px);
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 10px;
  background: #1f2937;
  color: white;
  box-shadow: 0 2px 10px #0005;
  z-index: 90;
  font-size: 12px;
}
.controls { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 10px; }
button { padding: 7px 10px; border: 1px solid #94a3b8; border-radius: 6px; background: #374151; color: white; cursor: pointer; font: inherit; }
button:hover { background: #4b5563; }
button:focus-visible, input:focus-visible { outline: 2px solid #93c5fd; outline-offset: 3px; }
button:disabled { opacity: .6; cursor: wait; }
label { display: flex; align-items: center; gap: 4px; }
p { margin: 6px 0 0; }
</style>
