/**
 * Generates favicon and PWA icon assets from public/icons/icon.svg
 * Run: node scripts/generate-favicons.mjs
 */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "public", "icons", "icon.svg");
const svg = readFileSync(svgPath);

const outputs = [
  { path: "public/favicon-16x16.png", size: 16 },
  { path: "public/favicon-32x32.png", size: 32 },
  { path: "public/favicon-48x48.png", size: 48 },
  { path: "public/apple-touch-icon.png", size: 180 },
  { path: "public/android-chrome-192x192.png", size: 192 },
  { path: "public/android-chrome-512x512.png", size: 512 },
  { path: "public/android-chrome-192.png", size: 192 },
  { path: "public/android-chrome-512.png", size: 512 },
  { path: "public/icons/icon-192.png", size: 192 },
  { path: "public/icons/icon-512.png", size: 512 },
];

async function generateMaskable(size, padding) {
  const inner = size - padding * 2;
  const icon = await sharp(svg).resize(inner, inner).png().toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 102, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: icon, gravity: "centre" }])
    .png()
    .toBuffer();
}

async function generateFaviconIco() {
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map((s) => sharp(svg).resize(s, s).png().toBuffer())
  );

  const headerSize = 6 + 16 * sizes.length;
  let offset = headerSize;
  const entries = pngBuffers.map((buf, i) => {
    const entry = { size: sizes[i], offset, length: buf.length };
    offset += buf.length;
    return entry;
  });

  const totalSize = offset;
  const buffer = Buffer.alloc(totalSize);

  buffer.writeUInt16LE(0, 0);
  buffer.writeUInt16LE(1, 2);
  buffer.writeUInt16LE(sizes.length, 4);

  entries.forEach((entry, i) => {
    const base = 6 + i * 16;
    buffer.writeUInt8(entry.size === 256 ? 0 : entry.size, base);
    buffer.writeUInt8(entry.size === 256 ? 0 : entry.size, base + 1);
    buffer.writeUInt8(0, base + 2);
    buffer.writeUInt8(0, base + 3);
    buffer.writeUInt16LE(1, base + 4);
    buffer.writeUInt16LE(32, base + 6);
    buffer.writeUInt32LE(entry.length, base + 8);
    buffer.writeUInt32LE(entry.offset, base + 12);
  });

  let pos = headerSize;
  pngBuffers.forEach((buf) => {
    buf.copy(buffer, pos);
    pos += buf.length;
  });

  writeFileSync(join(root, "public", "favicon.ico"), buffer);
  writeFileSync(join(root, "src", "app", "favicon.ico"), buffer);
}

async function main() {
  for (const { path, size } of outputs) {
    await sharp(svg).resize(size, size).png().toFile(join(root, path));
    console.log(`Created ${path}`);
  }

  const maskable = await generateMaskable(512, 64);
  writeFileSync(join(root, "public", "icons", "maskable-icon-512.png"), maskable);
  console.log("Created public/icons/maskable-icon-512.png");

  await generateFaviconIco();
  console.log("Created public/favicon.ico and src/app/favicon.ico");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
