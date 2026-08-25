/**
 * Canvas-generated textures for the SliceUI 3D landing scene.
 * Everything is procedural — no external assets, no loading states.
 */
import * as THREE from "three";

export interface ScenePalette {
  indigo: string;
  violet: string;
  cyan: string;
  emerald: string;
  amber: string;
  rose: string;
}

export const SCENE_COLORS: ScenePalette = {
  indigo: "#818cf8",
  violet: "#a78bfa",
  cyan: "#22d3ee",
  emerald: "#34d399",
  amber: "#fbbf24",
  rose: "#fb7185",
};

function makeCanvas(w = 512, h = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext("2d")! };
}

function makeTexture(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  w = 512,
  h = 512,
): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(w, h);
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Soft radial dot for the particle field. */
export function dotsTexture(size = 64): THREE.CanvasTexture {
  return makeTexture((ctx) => {
    const c = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    c.addColorStop(0, "rgba(255,255,255,1)");
    c.addColorStop(0.25, "rgba(255,255,255,0.6)");
    c.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, size, size);
  }, size, size);
}
