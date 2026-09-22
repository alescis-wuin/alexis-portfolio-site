import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const catalog = JSON.parse(
  readFileSync(path.join(rootDir, "data", "projects.json"), "utf8"),
);

let checked = 0;

for (const project of catalog.projects) {
  if (!project.visuals) continue;

  const media = [
    ["visuals.hero", project.visuals.hero],
    ["visuals.architecture", project.visuals.architecture],
    ...project.visuals.gallery.map((item, index) => [
      `visuals.gallery[${index}]`,
      item,
    ]),
  ];

  for (const [field, item] of media) {
    const filePath = path.join(rootDir, item.src);
    const dimensions =
      item.kind === "screenshot"
        ? readWebpDimensions(filePath, `${project.id}.${field}`)
        : readSvgDimensions(filePath, `${project.id}.${field}`);

    if (dimensions.width !== item.width || dimensions.height !== item.height) {
      throw new Error(
        `${project.id}.${field} : dimensions déclarées ${item.width}x${item.height}, fichier ${dimensions.width}x${dimensions.height} (${item.src}).`,
      );
    }

    checked += 1;
  }
}

console.log(`Validation médias OK (${checked} fichier(s)).`);

function readWebpDimensions(filePath, field) {
  const buffer = readFileSync(filePath);
  if (buffer.length < 20) {
    throw new Error(`${field} : WebP tronqué (${relative(filePath)}).`);
  }
  if (
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WEBP"
  ) {
    throw new Error(
      `${field} : signature WebP invalide (${relative(filePath)}).`,
    );
  }

  const declaredLength = buffer.readUInt32LE(4) + 8;
  if (declaredLength !== buffer.length) {
    throw new Error(
      `${field} : taille RIFF incohérente, ${declaredLength} octets déclarés pour ${buffer.length} octets réels (${relative(filePath)}).`,
    );
  }

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunkType = buffer.toString("ascii", offset, offset + 4);
    const chunkLength = buffer.readUInt32LE(offset + 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + chunkLength;

    if (dataEnd > buffer.length) {
      throw new Error(
        `${field} : chunk ${chunkType} tronqué (${relative(filePath)}).`,
      );
    }

    const dimensions = parseWebpChunkDimensions(
      buffer,
      chunkType,
      dataStart,
      chunkLength,
    );
    if (dimensions) return dimensions;

    offset = dataEnd + (chunkLength % 2);
  }

  throw new Error(
    `${field} : dimensions WebP introuvables (${relative(filePath)}).`,
  );
}

function parseWebpChunkDimensions(buffer, chunkType, start, length) {
  if (chunkType === "VP8X" && length >= 10) {
    return {
      width: 1 + readUInt24LE(buffer, start + 4),
      height: 1 + readUInt24LE(buffer, start + 7),
    };
  }

  if (chunkType === "VP8L" && length >= 5 && buffer[start] === 0x2f) {
    const bits = buffer.readUInt32LE(start + 1);
    return {
      width: 1 + (bits & 0x3fff),
      height: 1 + ((bits >>> 14) & 0x3fff),
    };
  }

  if (
    chunkType === "VP8 " &&
    length >= 10 &&
    buffer[start + 3] === 0x9d &&
    buffer[start + 4] === 0x01 &&
    buffer[start + 5] === 0x2a
  ) {
    return {
      width: buffer.readUInt16LE(start + 6) & 0x3fff,
      height: buffer.readUInt16LE(start + 8) & 0x3fff,
    };
  }

  return null;
}

function readUInt24LE(buffer, offset) {
  return (
    buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16)
  );
}

function readSvgDimensions(filePath, field) {
  const source = readFileSync(filePath, "utf8");
  const root = source.match(/<svg\b([^>]*)>/i);
  if (!root) {
    throw new Error(`${field} : racine SVG absente (${relative(filePath)}).`);
  }
  if (/<script\b/i.test(source)) {
    throw new Error(
      `${field} : script interdit dans le SVG (${relative(filePath)}).`,
    );
  }

  const width = readNumericSvgAttribute(root[1], "width");
  const height = readNumericSvgAttribute(root[1], "height");
  if (width === null || height === null) {
    throw new Error(
      `${field} : width/height SVG numériques requis (${relative(filePath)}).`,
    );
  }

  return { width, height };
}

function readNumericSvgAttribute(attributes, name) {
  const match = attributes.match(
    new RegExp(`\\b${name}\\s*=\\s*["']([0-9]+(?:\\.[0-9]+)?)["']`, "i"),
  );
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function relative(filePath) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, "/");
}
