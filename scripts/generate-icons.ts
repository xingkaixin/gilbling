import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

type IconSpec = {
  size: number;
  filename: string;
};

const iconSpecs: IconSpec[] = [
  { size: 16, filename: "icon16.png" },
  { size: 32, filename: "icon32.png" },
  { size: 48, filename: "icon48.png" },
  { size: 128, filename: "icon128.png" },
];

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.resolve(currentDir, "../public/logo.svg");
const outputDir = path.resolve(currentDir, "../public/icons");

async function ensureOutputDir() {
  await mkdir(outputDir, { recursive: true });
}

async function renderIcon(spec: IconSpec, source: Buffer) {
  const density = Math.max(spec.size * 4, 256);

  await sharp(source, { density })
    .resize(spec.size, spec.size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(outputDir, spec.filename));
}

async function generateIcons() {
  const svg = await readFile(logoPath);
  await ensureOutputDir();

  await Promise.all(iconSpecs.map((spec) => renderIcon(spec, svg)));
}

generateIcons()
  .then(() => {
    console.log(`已生成图标到 ${outputDir}`);
  })
  .catch((error) => {
    console.error("生成图标失败:", error);
    process.exitCode = 1;
  });
