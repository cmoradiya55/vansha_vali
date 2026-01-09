const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcon() {
  const faviconPath = path.join(__dirname, '..', 'app', 'favicon.ico');
  const outputPath = path.join(__dirname, '..', 'resources', 'icon.png');

  try {
    // Ensure resources directory exists
    const resourcesDir = path.join(__dirname, '..', 'resources');
    if (!fs.existsSync(resourcesDir)) {
      fs.mkdirSync(resourcesDir, { recursive: true });
    }

    // Convert favicon.ico to 1024x1024 PNG
    await sharp(faviconPath)
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
      })
      .png()
      .toFile(outputPath);

    console.log('✅ Successfully created icon.png at:', outputPath);
    console.log('📱 Now run: npm run cap:assets');
  } catch (error) {
    console.error('❌ Error generating icon:', error.message);
    process.exit(1);
  }
}

generateIcon();

