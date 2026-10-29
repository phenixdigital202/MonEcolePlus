const fs = require('fs');
const path = require('path');

const imgPath = path.join(__dirname, '..', 'Image', 'android-chrome-512x512.png');
const outPath = path.join(__dirname, '..', 'public', 'icon.svg');

if (fs.existsSync(imgPath)) {
  const b64 = fs.readFileSync(imgPath).toString('base64');
  const svg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <image href="data:image/png;base64,${b64}" width="512" height="512" />
</svg>
`;
  fs.writeFileSync(outPath, svg, 'utf-8');
  console.log('Successfully updated public/icon.svg with MonEcole+ logo!');
} else {
  console.error('Image file not found:', imgPath);
}
