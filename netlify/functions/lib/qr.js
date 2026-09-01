const qrcodeGen = require('qrcode-generator');

// Renders `text` as a self-contained SVG string: a QR matrix computed by
// qrcode-generator (zero dependencies), drawn as one <rect> per dark module.
// SVG keeps the image crisp at any display size/pixel density, and needs no
// PNG-encoding dependency chain.
function renderQrSvg(text, { dark = '#551C25', light = '#FCF8F0', size = 440, margin = 4 } = {}) {
  const qr = qrcodeGen(0, 'M'); // type 0 = auto-select smallest version; M = 15% error correction
  qr.addData(text);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const cell = size / (moduleCount + margin * 2);

  let rects = '';
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        const x = (col + margin) * cell;
        const y = (row + margin) * cell;
        rects += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${dark}"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">` +
    `<rect width="${size}" height="${size}" fill="${light}"/>${rects}</svg>`;
}

module.exports = { renderQrSvg };
