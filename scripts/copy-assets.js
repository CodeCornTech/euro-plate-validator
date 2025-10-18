// scripts/copy-assets.js
import fs from 'fs';
import path from 'path';

const src = path.resolve('src/assets');
const dst = path.resolve('dist/assets');

fs.mkdirSync(dst, { recursive: true });
fs.cpSync(src, dst, { recursive: true });
console.log('✅ Copied assets to dist/assets');
