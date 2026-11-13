// Geometry for placing boxes and drawing the links between them.
// A box is { left, top, right, bottom } in canvas pixels.

export function boxesOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

// SVG path for a curved link from the bottom centre of the source box to the
// top centre of the target box
export function linkPath(source, target) {
  const sourceX = (source.left + source.right) / 2;
  const sourceY = source.bottom;
  const targetX = (target.left + target.right) / 2;
  const targetY = target.top;

  const distance = Math.abs(targetY - sourceY);
  const curve = Math.min(distance * 0.5, 80);

  return `M${sourceX},${sourceY} C${sourceX},${sourceY + curve} ${targetX},${targetY - curve} ${targetX},${targetY}`;
}

// Find a place for a new box below its parent that does not cover another
// box. Places are tried directly below the parent first, then to the right
// and left in turn, then on the next row down. If the area is full, the new
// box is placed in a small cascade instead of on top of the last one.
export function findFreePosition({
  parent,
  occupied,
  canvasWidth,
  boxWidth,
  boxHeight,
  siblingCount,
}) {
  const gap = 20;
  const margin = 8;
  const stepX = boxWidth + gap;
  const rowHeight = 90;
  const parentHeight = parent.bottom - parent.top;
  const firstRowY = parent.top + Math.max(150, parentHeight + 80);
  const maxX = Math.max(margin, canvasWidth - boxWidth - margin);

  const isFree = (x, y) => occupied.every(box =>
    x + boxWidth + gap <= box.left ||
    x >= box.right + gap ||
    y + boxHeight + gap <= box.top ||
    y >= box.bottom + gap
  );

  for (let row = 0; row < 6; row++) {
    const y = firstRowY + row * rowHeight;
    for (let step = 0; step < 9; step++) {
      // 0, +1, -1, +2, -2, ... columns away from the parent
      const column = step % 2 === 1 ? (step + 1) / 2 : -step / 2;
      const x = parent.left + column * stepX;
      if (x >= margin && x <= maxX && isFree(x, y)) {
        return { x, y };
      }
    }
  }

  return {
    x: Math.min(maxX, parent.left + 30 * siblingCount),
    y: firstRowY + 30 * siblingCount,
  };
}
