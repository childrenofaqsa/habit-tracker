import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const publicDir = fileURLToPath(new URL("../public/", import.meta.url));
const svgPath = path.join(publicDir, "favicon.svg");
const svgBuffer = readFileSync(svgPath);

const targets = [
  ["pwa-192.png", 192],
  ["pwa-512.png", 512],
  ["apple-touch-icon.png", 180],
];

for (const [name, size] of targets) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, name));
  console.log("wrote", name, `(${size}x${size})`);
}
