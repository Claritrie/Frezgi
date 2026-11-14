import { computed, reactive, ref, watch } from 'vue';
import { DEFAULT_RESOLUTION_TEXT, RESOLUTION_ID, STORAGE_KEYS, NODE_WIDTH } from '../constants.js';

import { restoreTrie, trieSnapshot } from '../utils/trieStorage.js';

// The argument map: one resolution, the points added to it, and the links
// from each point to the point it answers.
export function useArgumentMap() {
  const resolution = reactive({
    id: RESOLUTION_ID,
    type: 'resolution',
    text: DEFAULT_RESOLUTION_TEXT,
    position: { x: 300, y: 100 },
    showMenu: false,
  });

  const points = ref([]);
  // Each link is { source, target }: the target point answers the source
  const links = ref([]);
  let nextId = 1;

  // Reasons can only be added once the user has written a resolution
  const resolutionIsSet = computed(() => resolution.text.trim() !== DEFAULT_RESOLUTION_TEXT);

  // True once any point answers another point, not only the resolution
  const hasReplyToPoint = computed(() => links.value.some(link => link.source !== RESOLUTION_ID));

  const allNodes = computed(() => [resolution, ...points.value]);

  function getNode(id) {
    return id === RESOLUTION_ID ? resolution : points.value.find(point => point.id === id);
  }

  function parentOf(id) {
    const link = links.value.find(l => l.target === id);
    return link ? getNode(link.source) : null;
  }

  function childCount(id) {
    return links.value.filter(link => link.source === id).length;
  }

  // Ids of all points below this one: its children, their children, and so on
  function descendantsOf(id) {
    const found = [];
    const queue = [id];
    while (queue.length) {
      const current = queue.shift();
      for (const link of links.value) {
        if (link.source === current) {
          found.push(link.target);
          queue.push(link.target);
        }
      }
    }
    return found;
  }

  function addPoint({ parent, type, text, position }) {
    const point = { id: `point-${nextId++}`, type, text, position, showMenu: false };
    points.value.push(point);
    links.value.push({ source: parent.id, target: point.id });
    return point;
  }

  // Remove a point together with all the points below it
  function removePoint(id) {
    const removed = new Set([id, ...descendantsOf(id)]);
    points.value = points.value.filter(point => !removed.has(point.id));
    links.value = links.value.filter(link => !removed.has(link.source) && !removed.has(link.target));
  }

  function setText(node, text) {
    node.text = text;
  }

  function moveNode(node, position) {
    node.position = position;
  }

  function setMenuVisible(node, visible) {
    node.showMenu = visible;
  }

  const saveStatus = ref('');
  const restored = restoreTrie();
  if (restored) {
    Object.assign(resolution, restored.resolution);
    points.value = restored.points;
    links.value = restored.links;
    nextId = restored.nextId;
  }

  function snapshot() {
    return trieSnapshot(resolution, points.value, links.value);
  }

  watch(snapshot, value => {
    try {
      localStorage.setItem(STORAGE_KEYS.trie, JSON.stringify(value));
      saveStatus.value = 'Saved on this device';
    } catch {
      saveStatus.value = 'Unable to save on this device. Export a PNG to keep a copy.';
    }
  }, { deep: true, flush: 'sync' });

  function newTrie() {
    points.value = [];
    links.value = [];
    nextId = 1;
    Object.assign(resolution, {
      text: DEFAULT_RESOLUTION_TEXT,
      position: { x: Math.max(16, Math.round((window.innerWidth - NODE_WIDTH) / 2)), y: 100 },
      showMenu: false,
    });
  }

  // reactive() unwraps the refs, so that components can read them directly
  return reactive({
    restored: !!restored,
    saveStatus,
    newTrie,
    resolution,
    points,
    links,
    allNodes,
    resolutionIsSet,
    hasReplyToPoint,
    getNode,
    parentOf,
    childCount,
    descendantsOf,
    addPoint,
    removePoint,
    setText,
    moveNode,
    setMenuVisible,
  });
}
