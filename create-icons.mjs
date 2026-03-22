import fs from 'fs';

function generateSVG(size, fileName) {
    const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#7F77DD"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${Math.floor(size * 0.6)}" font-weight="bold" fill="white">G</text>
</svg>
    `.trim();
    
    fs.writeFileSync(`./public/${fileName}`, svg);
    console.log(`Creado ${fileName}`);
}

generateSVG(192, 'icon-192.svg');
generateSVG(512, 'icon-512.svg');
