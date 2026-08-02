// ============================================================================
// App-Icons aus der Bildmarke in public/icons/icon.svg erzeugen.
//
// Warum selbst rastern statt eine Bibliothek zu benutzen: das Projekt hat keine
// Bildabhängigkeit (kein sharp, kein canvas), und eine für ein einziges Icon
// hinzuzunehmen wäre ein dickes natives Paket im Installationspfad. Die Marke
// besteht aus fünf Kapseln und einem abgerundeten Rechteck – dafür reichen zwei
// Abstandsfunktionen. Die PNG-Kodierung selbst ist ein Header, ein
// zlib-Deflate-Block (Node-Bordmittel) und drei CRC32-Prüfsummen.
//
// Aufruf: npm run gen:icons
// ============================================================================

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUTPUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

// Hintergrund identisch zu themeColor in app/layout.tsx – auf iOS grenzt die
// Kachel direkt an die Statusleiste, ein abweichender Ton fiele sofort auf.
const BACKGROUND = [0x0f, 0x17, 0x20];
const FOREGROUND = [0xff, 0xff, 0xff];

// Koordinaten aus public/icons/icon.svg (viewBox 0 0 32 32), Strichstärke 2.5 mit runden
// Enden = Kapseln mit Radius 1.25.
const VIEWBOX = 32;
const STROKE_RADIUS = 1.25;
const BARS = [
  [8, 12, 8, 20],
  [12, 9.5, 12, 22.5],
  [20, 9.5, 20, 22.5],
  [24, 12, 24, 20],
  [12, 16, 20, 16],
];

// 4×4 Abtastungen je Pixel. Die Marke besteht fast nur aus Rundungen; ohne
// Überabtastung sind die Kanten bei 192 px sichtbar treppig.
const SAMPLES_PER_AXIS = 4;

function distanceToSegment(px, py, ax, ay, bx, by) {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const lengthSquared = bax * bax + bay * bay;
  const t =
    lengthSquared === 0 ? 0 : Math.min(1, Math.max(0, (pax * bax + pay * bay) / lengthSquared));
  return Math.hypot(pax - bax * t, pay - bay * t);
}

function distanceToRoundedRect(px, py, halfSize, radius) {
  const qx = Math.abs(px - halfSize) - (halfSize - radius);
  const qy = Math.abs(py - halfSize) - (halfSize - radius);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
}

/**
 * @param size          Kantenlänge in Pixeln
 * @param cornerRadius  Anteil der Kantenlänge; 0.5 ergäbe einen Kreis, 0 eine
 *                      randlose Fläche (iOS und maskable runden selbst).
 * @param markScale     Verkleinerung der Marke. Maskable-Icons dürfen nur die
 *                      inneren 80 % nutzen, weil Android beliebig beschneidet.
 */
function renderIcon(size, { cornerRadius, markScale }) {
  const pixels = Buffer.alloc(size * size * 4);
  const unit = size / VIEWBOX;
  const halfSize = size / 2;
  const radiusPx = cornerRadius * size;
  const strokeRadiusPx = STROKE_RADIUS * unit * markScale;

  // Marke um die Bildmitte skalieren statt um den Ursprung.
  const bars = BARS.map(([ax, ay, bx, by]) => [
    halfSize + (ax * unit - halfSize) * markScale,
    halfSize + (ay * unit - halfSize) * markScale,
    halfSize + (bx * unit - halfSize) * markScale,
    halfSize + (by * unit - halfSize) * markScale,
  ]);

  const step = 1 / SAMPLES_PER_AXIS;
  const samplesPerPixel = SAMPLES_PER_AXIS * SAMPLES_PER_AXIS;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let backgroundHits = 0;
      let markHits = 0;

      for (let sy = 0; sy < SAMPLES_PER_AXIS; sy++) {
        for (let sx = 0; sx < SAMPLES_PER_AXIS; sx++) {
          const px = x + (sx + 0.5) * step;
          const py = y + (sy + 0.5) * step;

          if (radiusPx > 0 && distanceToRoundedRect(px, py, halfSize, radiusPx) > 0) continue;
          backgroundHits++;

          for (const [ax, ay, bx, by] of bars) {
            if (distanceToSegment(px, py, ax, ay, bx, by) <= strokeRadiusPx) {
              markHits++;
              break;
            }
          }
        }
      }

      const offset = (y * size + x) * 4;
      const alpha = backgroundHits / samplesPerPixel;

      if (backgroundHits === 0) {
        pixels.writeUInt32BE(0, offset);
        continue;
      }

      // Die Marke liegt vollständig im Hintergrund, markHits <= backgroundHits.
      // Farbe ist deren Mischung, die Deckkraft kommt allein vom Hintergrund.
      const markShare = markHits / backgroundHits;
      for (let channel = 0; channel < 3; channel++) {
        pixels[offset + channel] = Math.round(
          BACKGROUND[channel] * (1 - markShare) + FOREGROUND[channel] * markShare,
        );
      }
      pixels[offset + 3] = Math.round(alpha * 255);
    }
  }

  return pixels;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(size, pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // Bittiefe
  header[9] = 6; // Farbtyp RGBA
  header[10] = 0; // Kompression: Deflate
  header[11] = 0; // Filter: adaptiv
  header[12] = 0; // kein Interlacing

  // Jede Bildzeile bekommt ein führendes Filterbyte. 0 = "keine Vorhersage":
  // bei diesen großen einfarbigen Flächen komprimiert Deflate ohnehin exzellent,
  // ein aufwendigerer Filter brächte nichts.
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// cornerRadius 0.22 kommt der Rundung nahe, die Android und Desktop-Launcher
// für "purpose: any" erwarten. Maskable und Apple bekommen die volle Fläche:
// beide Plattformen schneiden die Kachel selbst zurecht, ein eigener Radius
// ergäbe dort einen doppelt gerundeten Rand mit dunklen Ecken.
const ICONS = [
  { file: "icon-192.png", size: 192, cornerRadius: 0.22, markScale: 1 },
  { file: "icon-512.png", size: 512, cornerRadius: 0.22, markScale: 1 },
  { file: "icon-maskable-192.png", size: 192, cornerRadius: 0, markScale: 0.8 },
  { file: "icon-maskable-512.png", size: 512, cornerRadius: 0, markScale: 0.8 },
  { file: "apple-touch-icon-180.png", size: 180, cornerRadius: 0, markScale: 1 },
];

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const { file, size, cornerRadius, markScale } of ICONS) {
  const png = encodePng(size, renderIcon(size, { cornerRadius, markScale }));
  writeFileSync(join(OUTPUT_DIR, file), png);
  console.log(`${file}  ${size}×${size}  ${(png.length / 1024).toFixed(1)} kB`);
}
