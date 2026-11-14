import { POINT_TYPES, RESOLUTION_ID, STORAGE_KEYS } from '../constants.js';
import { readStorage } from './storage.js';

// Save content and geometry only, never temporary hover/drag state.
export function trieSnapshot(resolution, points, links) {
  const node = ({ id, type, text, position }) => ({ id, type, text, position: { ...position } });
  return { version: 1, resolution: node(resolution), points: points.map(node), links: links.map(link => ({ ...link })) };
}

export function restoreTrie() {
  try {
    const data = JSON.parse(readStorage(STORAGE_KEYS.trie));
    if (!data || data.version !== 1 || !Array.isArray(data.points) || !Array.isArray(data.links)) return null;
    const validNode = node => node && typeof node.text === 'string' && node.text.trim() &&
      Number.isFinite(node.position?.x) && Number.isFinite(node.position?.y);
    if (!validNode(data.resolution) || data.resolution.id !== RESOLUTION_ID || data.resolution.type !== 'resolution') return null;
    const ids = new Set([RESOLUTION_ID]);
    let nextId = 1;
    for (const point of data.points) {
      if (!validNode(point) || !/^point-[1-9]\d*$/.test(point.id) || !POINT_TYPES.includes(point.type) || ids.has(point.id)) return null;
      ids.add(point.id);
      nextId = Math.max(nextId, Number(point.id.slice(6)) + 1);
    }
    if (!Number.isSafeInteger(nextId) || data.links.length !== data.points.length) return null;
    const parents = new Map();
    for (const link of data.links) {
      if (!ids.has(link.source) || !ids.has(link.target) || link.target === RESOLUTION_ID || parents.has(link.target)) return null;
      parents.set(link.target, link.source);
    }
    for (const point of data.points) {
      const visited = new Set();
      let id = point.id;
      while (id !== RESOLUTION_ID) {
        if (!parents.has(id) || visited.has(id)) return null;
        visited.add(id);
        id = parents.get(id);
      }
    }
    // Rebuild known fields rather than accepting arbitrary stored properties.
    const clean = trieSnapshot(data.resolution, data.points, data.links);
    return { ...clean, nextId };
  } catch {
    return null;
  }
}
