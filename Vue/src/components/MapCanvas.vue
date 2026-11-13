<script setup>
import { computed, ref } from 'vue';
import MapNode from './MapNode.vue';
import { NODE_BASE_HEIGHT, NODE_MENU_HEIGHT, NODE_WIDTH } from '../constants.js';
import { useColorScheme } from '../composables/useColorScheme.js';
import { isLightColor } from '../utils/color.js';
import { boxesOverlap, findFreePosition as findFreeSpot, linkPath } from '../utils/layout.js';

// The drawing area: the boxes, the links between them, dragging, and the
// hint for the first steps
const props = defineProps({
  // The map from useArgumentMap()
  map: { type: Object, required: true },
  // While a dialog is open, the buttons on the boxes are hidden
  dialogOpen: { type: Boolean, default: false },
  showHint: { type: Boolean, default: true },
});

const emit = defineEmits(['edit', 'add']);

const colors = useColorScheme();
const root = ref(null);
const draggingNode = ref(null);
const nodeHeights = ref({});
// Set while a dragged box is over its parent: { nodeId, parentId, ids }
const pendingDelete = ref(null);

// Box of a node as used for links and overlap; the menu makes it taller
function box(node, height = nodeHeights.value[node.id] ?? (node.showMenu ? NODE_MENU_HEIGHT : NODE_BASE_HEIGHT)) {
  return {
    left: node.position.x,
    top: node.position.y,
    right: node.position.x + NODE_WIDTH,
    bottom: node.position.y + height,
  };
}

const lines = computed(() => props.map.links.map(link => {
  const source = props.map.getNode(link.source);
  const target = props.map.getNode(link.target);
  return {
    id: link.target,
    path: linkPath(box(source), box(target)),
    color: colors.nodeColors[target.type],
  };
}));

const resolution = computed(() => props.map.resolution);

// Leave room for the action tooltips below the expanded resolution.
const hintStyle = computed(() => ({
  top: resolution.value.position.y + (nodeHeights.value[resolution.value.id] ?? 104) + (props.map.resolutionIsSet ? 48 : 16) + 'px',
  left: resolution.value.position.x - 55 + 'px',
  color: isLightColor(colors.canvasColor) ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
}));

const pendingDeleteMessage = computed(() => {
  const subPoints = pendingDelete.value ? pendingDelete.value.ids.length - 1 : 0;
  if (subPoints === 0) {
    return 'Release to remove this point';
  }
  return `Release to remove this point and its ${subPoints} sub-point${subPoints === 1 ? '' : 's'}`;
});

function isPendingDelete(id) {
  return !!pendingDelete.value && pendingDelete.value.ids.includes(id);
}

// Work out whether releasing the dragged node now would remove it
function updatePendingDelete(node) {
  const parent = props.map.parentOf(node.id);
  const next = parent && boxesOverlap(box(node), box(parent))
    ? { nodeId: node.id, parentId: parent.id, ids: [node.id, ...props.map.descendantsOf(node.id)] }
    : null;
  // Only replace the value when the result changes, to avoid extra renders
  const current = pendingDelete.value;
  if ((next && next.nodeId) !== (current && current.nodeId) || (next && next.parentId) !== (current && current.parentId)) {
    pendingDelete.value = next;
  }
}

function startDrag(event, node) {
  event.preventDefault();
  draggingNode.value = node;
  const start = { x: event.clientX, y: event.clientY, nodeX: node.position.x, nodeY: node.position.y };

  const onMove = moveEvent => {
    props.map.moveNode(node, {
      x: start.nodeX + moveEvent.clientX - start.x,
      y: start.nodeY + moveEvent.clientY - start.y,
    });
    updatePendingDelete(node);
  };

  // A point released over its parent is removed, with its sub-points
  const onUp = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    updatePendingDelete(node);
    if (pendingDelete.value) {
      props.map.removePoint(pendingDelete.value.nodeId);
    }
    pendingDelete.value = null;
    draggingNode.value = null;
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// Height of a node as drawn; long text makes a node taller than the base height
function drawnHeight(node) {
  const element = root.value && root.value.querySelector(`[data-node-id="${node.id}"]`);
  return element ? element.offsetHeight : NODE_BASE_HEIGHT;
}

// Where to place a new point below this parent without covering other boxes
function findFreePosition(parent) {
  return findFreeSpot({
    parent: box(parent, drawnHeight(parent)),
    occupied: props.map.allNodes.map(node => box(node, drawnHeight(node))),
    canvasWidth: root.value ? root.value.clientWidth : window.innerWidth,
    boxWidth: NODE_WIDTH,
    boxHeight: NODE_BASE_HEIGHT,
    siblingCount: props.map.childCount(parent.id),
  });
}

defineExpose({ findFreePosition });
</script>

<template>
  <div ref="root" class="canvas" :style="{ backgroundColor: colors.canvasColor }">
    <svg class="lines">
      <path
        v-for="line in lines"
        :key="line.id"
        :d="line.path"
        :stroke="line.color"
        :class="{ 'will-delete': isPendingDelete(line.id) }"
        fill="transparent"
        stroke-width="2.5"
        stroke-linecap="round"
      />
    </svg>

    <MapNode
      v-for="node in map.allNodes"
      :key="node.id"
      :node="node"
      :menu-enabled="!dialogOpen"
      :ask-for-resolution="node === resolution && !map.resolutionIsSet"
      :dragging="draggingNode === node"
      :will-delete="isPendingDelete(node.id)"
      :drop-target="!!pendingDelete && pendingDelete.parentId === node.id"
      @drag-start="startDrag($event, node)"
      @hover="visible => map.setMenuVisible(node, visible)"
      @resize="height => nodeHeights[node.id] = height"
      @edit="emit('edit', node)"
      @add="type => emit('add', { type, parent: node })"
    />

    <p
      v-if="pendingDelete && draggingNode"
      class="delete-badge"
      role="status"
      :style="{
        top: draggingNode.position.y - 34 + 'px',
        left: draggingNode.position.x + NODE_WIDTH / 2 + 'px',
      }"
    >{{ pendingDeleteMessage }}</p>

    <!-- Hint for the first steps, shown until the first point is added -->
    <p v-if="showHint && map.points.length === 0" class="empty-hint" :style="hintStyle">
      <template v-if="!map.resolutionIsSet">
        First, write the statement you want to examine.<br />
        Then you can add reasons for and against it.
      </template>
      <template v-else>
        Hover over your resolution to add a reason for or against it.<br />
        Double-click any box to edit its text.
      </template>
    </p>
  </div>
</template>

<style scoped>
.canvas {
  position: absolute;
  inset: 0;
  overflow: hidden;
  transition: background-color 0.3s ease;
}

.lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.lines path.will-delete {
  opacity: 0.35;
  stroke-dasharray: 6 4;
}

.delete-badge {
  position: absolute;
  margin: 0;
  padding: 4px 10px;
  transform: translateX(-50%);
  border-radius: 4px;
  background-color: #b91c1c;
  color: white;
  font-size: 13px;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  z-index: 4;
}

.empty-hint {
  position: absolute;
  width: 260px;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  pointer-events: none;
  user-select: none;
  z-index: 1;
}
</style>
