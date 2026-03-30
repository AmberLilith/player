// update-sw.js
import fs from 'fs';
import path from 'path';

const assetsDir = './dist/assets';
const swPath = './dist/sw.js';

const files = fs.readdirSync(assetsDir);
const js = files.find(f => f.endsWith('.js'));
const css = files.find(f => f.endsWith('.css'));

let sw = fs.readFileSync(swPath, 'utf-8');
sw = sw.replace(/\/assets\/index-.*?\.js/, `/assets/${js}`);
sw = sw.replace(/\/assets\/index-.*?\.css/, `/assets/${css}`);
fs.writeFileSync(swPath, sw);

console.log(`✅ SW atualizado: ${js}, ${css}`);