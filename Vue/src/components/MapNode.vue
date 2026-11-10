<script setup>
import { computed } from 'vue';
import { NODE_TYPES, NODE_WIDTH, POINT_TYPES } from '../constants.js';
import { useColorScheme } from '../composables/useColorScheme.js';

// One box on the map: the resolution or a point
const props = defineProps({
  node: { type: Object, required: true },
  // Show the buttons for adding points while the pointer is over the box
  menuEnabled: { type: Boolean, default: true },
  // Show "Write your resolution" instead of the buttons for adding points
  askForResolution: { type: Boolean, default: false },
  dragging: { type: Boolean, default: false },
  // This box is dragged over its parent and will be removed on release
  willDelete: { type: Boolean, default: false },
  // A box that is being removed is dragged over this box
  dropTarget: { type: Boolean, default: false },
});

const emit = defineEmits(['drag-start', 'hover', 'edit', 'add']);

const colors = useColorScheme();
const isResolution = computed(() => props.node.type === 'resolution');

const actions = POINT_TYPES.map(type => ({
  type,
  emoji: NODE_TYPES[type].emoji,
  label: NODE_TYPES[type].actionLabel,
}));
</script>

<template>
  <div
    class="node"
    :class="[isResolution ? 'resolution-node' : node.type, { dragging, 'will-delete': willDelete, 'drop-target': dropTarget }]"
    :data-node-id="node.id"
    :style="{
      top: node.position.y + 'px',
      left: node.position.x + 'px',
      width: NODE_WIDTH + 'px',
      backgroundColor: colors.nodeColors[node.type],
      color: colors.textColors[node.type],
    }"
    @mousedown="emit('drag-start', $event)"
    @mouseover="emit('hover', true)"
    @mouseleave="emit('hover', false)"
    @dblclick="emit('edit')"
  >
    {{ node.text }}
    <button
      v-if="askForResolution"
      type="button"
      class="resolution-cta"
      @mousedown.stop
      @click="emit('edit')"
    >Write your resolution</button>
    <div v-else-if="node.showMenu && menuEnabled" class="emoji-menu">
      <button
        v-for="action in actions"
        :key="action.type"
        type="button"
        class="emoji-btn"
        :aria-label="action.label"
        :data-tip="action.label"
        @mousedown.stop
        @click="emit('add', action.type)"
      >{{ action.emoji }}</button>
    </div>
  </div>
</template>

<style scoped>
.node {
  position: absolute;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.35;
  overflow-wrap: anywhere;
  text-align: center;
  cursor: grab;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  transition: height 0.2s ease, background-color 0.3s ease, color 0.3s ease, box-shadow 0.2s ease;
  z-index: 2;
}

.node:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
}

.resolution-node {
  border-width: 2px;
  border-color: rgba(0, 0, 0, 0.15);
  font-size: 15px;
  font-weight: 700;
}

.node.dragging {
  cursor: grabbing;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  z-index: 3;
}

/* Drag-to-remove feedback */
.node.will-delete {
  opacity: 0.55;
  outline: 2px dashed #ef4444;
  outline-offset: 2px;
}

.node.drop-target {
  outline: 3px solid #ef4444;
  outline-offset: 3px;
  box-shadow: 0 0 0 7px rgba(239, 68, 68, 0.3);
}

.resolution-cta {
  display: block;
  margin: 8px auto 0;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background-color: #2563eb;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.resolution-cta:hover,
.resolution-cta:focus-visible {
  background-color: #1d4ed8;
}

.emoji-menu {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}

.emoji-btn {
  position: relative;
  margin: 0;
  padding: 2px 6px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 18px;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.emoji-btn:hover,
.emoji-btn:focus-visible {
  outline: none;
  background-color: rgba(0, 0, 0, 0.15);
  transform: scale(1.15);
}

/* Tooltip that names the action */
.emoji-btn::after {
  content: attr(data-tip);
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  padding: 4px 8px;
  transform: translateX(-50%);
  border-radius: 4px;
  background-color: #1f2937;
  color: white;
  font-size: 12px;
  font-weight: normal;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 20;
}

.emoji-btn:hover::after,
.emoji-btn:focus-visible::after {
  opacity: 1;
}
</style>
