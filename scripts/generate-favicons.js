import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#2563EB"/>
  <!-- Controller Body -->
  <path d="M128 176C110.327 176 96 190.327 96 208V304C96 348.183 131.817 384 176 384C198.091 384 217.591 374.837 231.42 360.108L247.172 343.308C251.849 338.319 260.151 338.319 264.828 343.308L280.58 360.108C294.409 374.837 313.909 384 336 384C380.183 384 416 348.183 416 304V208C416 190.327 401.673 176 384 176H128Z" fill="white"/>
  <!-- D-Pad -->
  <rect x="160" y="224" width="16" height="48" rx="4" fill="#2563EB"/>
  <rect x="144" y="240" width="48" height="16" rx="4" fill="#2563EB"/>
  <!-- Action Buttons -->
  <circle cx="352" cy="228" r="10" fill="#2563EB"/>
  <circle cx="372" cy="248" r="10" fill="#2563EB"/>
  <circle cx="332" cy="248" r="10" fill="#2563EB"/>
  <circle cx="352" cy="268" r="10" fill="#2563EB"/>
  <!-- Thumbsticks -->
  <circle cx="208" cy="304" r="18" fill="#93C5FD"/>
  <circle cx="208" cy="304" r="10" fill="#1E40AF"/>
  <circle cx="304" cy="304" r="18" fill="#93C5FD"/>
  <circle cx="304" cy="304" r="10" fill="#1E40AF"/>
</svg>`;

async function generateFavicons() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save SVG assets
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
  fs.writeFileSync(path.join(publicDir, 'gamepad-icon.svg'), svgContent);

  const svgBuffer = Buffer.from(svgContent);

  // Render PNG sizes
  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const png48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  const png180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  const png192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();

  fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), png48);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);

  // Construct multi-resolution binary ICO file (16x16, 32x32, 48x48)
  const images = [
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
  ];

  const count = images.length;
  const headerSize = 6;
  const directorySize = 16 * count;
  let offset = headerSize + directorySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(count, 4); // Count

  const directories = [];
  const imageBuffers = [];

  for (const img of images) {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    dir.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    dir.writeUInt8(0, 2); // Palette
    dir.writeUInt8(0, 3); // Reserved
    dir.writeUInt16LE(1, 4); // Planes
    dir.writeUInt16LE(32, 6); // bpp
    dir.writeUInt32LE(img.buffer.length, 8); // Size
    dir.writeUInt32LE(offset, 12); // Offset

    directories.push(dir);
    imageBuffers.push(img.buffer);
    offset += img.buffer.length;
  }

  const icoBuffer = Buffer.concat([header, ...directories, ...imageBuffers]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Generated favicons successfully in /public!');
}

generateFavicons().catch((err) => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
