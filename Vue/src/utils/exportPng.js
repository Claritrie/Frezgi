import { NODE_WIDTH } from '../constants.js';
import { linkPath } from './layout.js';

// Render from trie data, independent of viewport clipping and hover controls.
export async function exportTriePng(map, colors, background) {
  await document.fonts.ready;
  const logo = new Image();
  logo.src = '/frezgi-logo.png';
  await logo.decode();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('PNG export is unavailable in this browser.');
  const fontFamily = getComputedStyle(document.querySelector('.app')).fontFamily;
  const nodes = map.allNodes.map(node => {
    const size = node.type === 'resolution' ? 15 : 14;
    const font = `${node.type === 'resolution' ? '700' : '400'} ${size}px ${fontFamily}`;
    ctx.font = font;
    const lines = [];
    let line = '';
    // Match CSS normal whitespace and overflow-wrap:anywhere. Prefer word breaks.
    for (const word of node.text.trim().split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= NODE_WIDTH - 28) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      line = '';
      for (const char of word) {
        if (line && ctx.measureText(line + char).width > NODE_WIDTH - 28) {
          lines.push(line);
          line = '';
        }
        line += char;
      }
    }
    if (line) lines.push(line);
    const height = lines.length * size * 1.35 + 24;
    return { ...node, font, size, lines, left: node.position.x, top: node.position.y,
      right: node.position.x + NODE_WIDTH, bottom: node.position.y + height, height };
  });
  // 112px also contains the Bezier control points when links run upwards.
  const padding = 112;
  const left = Math.min(...nodes.map(n => n.left)) - padding;
  const top = Math.min(...nodes.map(n => n.top)) - padding;
  const width = Math.ceil(Math.max(...nodes.map(n => n.right)) - left + padding);
  const height = Math.ceil(Math.max(...nodes.map(n => n.bottom)) - top + padding);
  const scale = 2;
  if (width * scale > 32767 || height * scale > 32767 || width * height * scale * scale > 64000000) {
    throw new Error('This trie is too large for a PNG. Move its points closer together and try again.');
  }
  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);
  if (background) {
    ctx.fillStyle = colors.canvasColor;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.translate(-left, -top);
  const byId = new Map(nodes.map(node => [node.id, node]));
  for (const link of map.links) {
    const target = byId.get(link.target);
    ctx.strokeStyle = colors.nodeColors[target.type];
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke(new Path2D(linkPath(byId.get(link.source), target)));
  }
  for (const node of nodes) {
    ctx.beginPath();
    ctx.roundRect(node.left, node.top, NODE_WIDTH, node.height, 10);
    ctx.fillStyle = colors.nodeColors[node.type];
    ctx.fill();
    ctx.lineWidth = node.type === 'resolution' ? 2 : 1;
    ctx.strokeStyle = node.type === 'resolution' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)';
    ctx.stroke();
    ctx.font = node.font;
    ctx.fillStyle = colors.textColors[node.type];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    node.lines.forEach((line, i) => ctx.fillText(line, node.left + NODE_WIDTH / 2, node.top + 12 + (i + 0.5) * node.size * 1.35));
  }
  // Keep the wordmark in the reserved top-left margin, above all trie nodes.
  // Its backing makes the same logo legible on transparent and opaque PNGs.
  const brandX = left + 24;
  const brandY = top + 24;
  ctx.beginPath();
  ctx.roundRect(brandX, brandY, 210, 64, 10);
  ctx.fillStyle = '#171c26';
  ctx.fill();
  const logoWidth = 180;
  const logoHeight = logoWidth * logo.naturalHeight / logo.naturalWidth;
  ctx.drawImage(logo, brandX + 15, brandY + 7, logoWidth, logoHeight);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#cbd5e1';
  ctx.font = `11px ${fontFamily}`;
  ctx.fillText('frezgi.com', brandX + 15, brandY + 55);

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Unable to create the PNG. Try a smaller trie.');
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${map.resolution.text.replace(/[^\p{L}\p{N} _-]/gu, '').trim().slice(0, 80) || 'trie'}.png`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
